import { useCallback, useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid/non-secure';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  ChatRequest,
  CreateMessage,
  Message,
  UseChatOptions,
  ChatRequestOptions,
  FunctionCall,
} from './sharedTypes';
import { Task } from '@/store/taskStore';
import { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { TaskSchema } from '@/lib/schema';
import { z } from 'zod';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import * as FileSystem from 'expo-file-system';
import { Goal } from '@/store/goalStore';
import { GoalSchema } from '@/lib/schema';


export type { Message, CreateMessage, UseChatOptions };

export type UseChatHelpers = {
  messages: Message[];
  error: undefined | Error;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  stop: () => void;
  setMessages: (messages: Message[]) => void;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleInputChange: (text: string) => void;
  handleSubmit: (chatRequestOptions?: ChatRequestOptions) => void;
  isLoading: boolean;
};

const getResponse = async (
  api: string,
  chatRequest: ChatRequest,
  setMessages: (messages: Message[]) => void,
  existingMessages: Message[],
  abortControllerRef: React.MutableRefObject<AbortController | null>,
  onFinish?: (message: Message) => void,
  onResponse?: (response: Response) => void | Promise<void>,
  sendExtraMessageFields?: boolean
) => {
  const previousMessages = existingMessages;
  setMessages([...existingMessages, ...chatRequest.messages]);

  try {
    const res = await fetch(api, {
      method: 'POST',
      body: JSON.stringify({
        messages: sendExtraMessageFields
          ? chatRequest.messages
          : chatRequest.messages.map(
            ({ role, content, name, function_call }) => ({
              role,
              content,
              ...(name !== undefined && { name }),
              ...(function_call !== undefined && {
                function_call: function_call,
              }),
            })
          ),
        ...chatRequest.options?.body,
        ...(chatRequest.functions !== undefined && {
          functions: chatRequest.functions,
        }),
        ...(chatRequest.function_call !== undefined && {
          function_call: chatRequest.function_call,
        }),
      }),
      headers: {
        'Content-Type': 'application/json',
        ...chatRequest.options?.headers,
      },
      ...(abortControllerRef.current !== null && {
        signal: abortControllerRef.current.signal,
      }),
    });

    if (onResponse) {
      await onResponse(res);
    }

    if (!res.ok) {
      throw new Error(await res.text() || 'Failed to fetch the chat response.');
    }

    const data = await res.json();

    const createdAt = new Date();
    const replyId = nanoid();
    const responseMessage: Message = {
      id: replyId,
      createdAt,
      content: data.content,
      role: 'assistant',
    };

    setMessages([...chatRequest.messages, responseMessage]);

    if (abortControllerRef.current === null) {
      return null;
    }

    if (onFinish) {
      onFinish(responseMessage);
    }

    return responseMessage;
  } catch (err) {
    console.error(err);
    setMessages(previousMessages);
    throw err;
  }
};

export function useChat({
  api = '/aiPrompt',
  id,
  initialMessages = [],
  initialInput = '',
  sendExtraMessageFields,
  onResponse,
  onFinish,
  onError,
}: UseChatOptions = {}): UseChatHelpers {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<undefined | Error>();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [input, setInput] = useState(initialInput);

  useEffect(() => {
    const loadMessages = async () => {
      if (id) {
        const storedMessages = await AsyncStorage.getItem(`chat_${id}`);
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
      }
    };
    loadMessages();
  }, [id]);

  useEffect(() => {
    if (id) {
      AsyncStorage.setItem(`chat_${id}`, JSON.stringify(messages));
    }
  }, [id, messages]);

  const triggerRequest = useCallback(
    async (chatRequest: ChatRequest) => {
      try {
        setIsLoading(true);
        setError(undefined);

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        await getResponse(
          api,
          chatRequest,
          setMessages,
          messages,
          abortControllerRef,
          onFinish,
          onResponse,
          sendExtraMessageFields
        );

        abortControllerRef.current = null;
      } catch (err) {
        if ((err as any).name === 'AbortError') {
          abortControllerRef.current = null;
          return null;
        }

        if (onError && err instanceof Error) {
          onError(err);
        }

        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [api, messages, onResponse, onFinish, onError, sendExtraMessageFields]
  );

  const append = useCallback(
    async (
      message: Message | CreateMessage,
      { options, functions, function_call }: ChatRequestOptions = {}
    ) => {
      if (!message.id) {
        message.id = nanoid();
      }

      const chatRequest: ChatRequest = {
        messages: messages.concat(message as Message),
        options,
        ...(functions !== undefined && { functions }),
        ...(function_call !== undefined && { function_call }),
      };

      return triggerRequest(chatRequest);
    },
    [messages, triggerRequest]
  );

  const reload = useCallback(
    async ({ options, functions, function_call }: ChatRequestOptions = {}) => {
      if (messages.length === 0) return null;

      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        const chatRequest: ChatRequest = {
          messages: messages.slice(0, -1),
          options,
          ...(functions !== undefined && { functions }),
          ...(function_call !== undefined && { function_call }),
        };

        return triggerRequest(chatRequest);
      }

      const chatRequest: ChatRequest = {
        messages,
        options,
        ...(functions !== undefined && { functions }),
        ...(function_call !== undefined && { function_call }),
      };

      return triggerRequest(chatRequest);
    },
    [messages, triggerRequest]
  );

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const handleInputChange = (text: string) => {
    setInput(text);
  };

  const handleSubmit = useCallback(
    ({ options, functions, function_call }: ChatRequestOptions = {}) => {
      if (!input) return;

      append(
        {
          content: input,
          role: 'user',
          createdAt: new Date(),
        },
        { options, functions, function_call }
      );
      setInput('');
    },
    [input, append]
  );

  return {
    messages,
    error,
    append,
    reload,
    stop,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
  };
}




type ResponseData = {
  success: "true"
  data: { tasks: Task[] }
} | {
  success: "false"
  error: string
}



export const fetchChatCompletion = async (apiKey: string, userMessage: string): Promise<ResponseData> => {
  const localUrl = "http://localhost:3000"
  const hostedUrl = "https://todolistserver-mu.vercel.app"
  const url = `${hostedUrl}/ai/tasks`; // Update this URL

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,

  };

  const body = JSON.stringify({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant."
      },
      {
        role: "user",
        content: userMessage
      }
    ]
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,

    });

    if (!response.ok) {
      console.log(response.body)
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const err = error as Error
    console.error("There was a problem with the fetch operation:", err.message);
    return { success: "false", error: err.message };
  }
};



export const useFetchAiImage = async (uri: string) => {

  const image = await fetch(uri)
  const blob = await image.blob()
  // const openai = new OpenAI({ apiKey: "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" })
  // openai.chat.completions.create({ model: "gpt-4o", messages: [{ ""}] })

}



export const useFetchAi = async (userMessage: string, tasks?: Task[], uri?: string | null) => {
  try {
    const openai = new OpenAI({ 
      apiKey: "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" 
    });


    // Fetch prayer times
    let prayerTimes = await fetch("https://hq.alkafeel.net/Api/init/init.php?timezone=+3&long=44&lati=32&v=jsonPrayerTimes");
    prayerTimes = await prayerTimes.json();

    // Base messages array
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a task management assistant. Your job is to help break down a goal into actionable tasks, assign realistic timeframes for each task, and provide subtasks when necessary. The tasks should follow the schema I'm providing, including fields like 'title', 'description', 'due date', 'start time', 'subtasks', and 'category'. Reply in the prompt language`
      },
      {
        role: "system",
        content: `startTime and startDate and alertDate should be in ISO format the start date should not be before the date of sending request`
      },
      { 
        role: "system", 
        content: JSON.stringify(prayerTimes) 
      },
      
    ];

    // Add image content if URI is provided
    if (userMessage.trim().length > 0) {
      messages.push({role: "user", content:[{
        type: "text",
        text: `Here is the goal: ${userMessage} Break this goal down into a list of specific tasks with due dates and times. Consider tasks such as research, planning, design, and team reviews. Make sure to spread the tasks out over the next month, and include any subtasks where appropriate.`
      }]})
    }
    if (uri) {
      try {
        const base64Image = await imageToBase64(uri);
        
        messages.push({
          role: "user",
          content: [ { type: "text", text: "What’s in this image?" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            }, 
          ],
        } as ChatCompletionMessageParam);
      } catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Failed to process image input');
      }
    } 

    console.log({messages: messages.at(-1)?.content?.at(0)})

    // Create completion with parsed response
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages,
      functions :[{"name": "generate_tasks", parameters: {previous_tasks: tasks, day: (new Date()).toISOString()}}],
      response_format: zodResponseFormat(z.object({ tasks: z.array(TaskSchema) }), "task"),
    });

    const generate_tasks = completion.choices[0].message.parsed as { tasks: Task[] };
    return { success: "true", data: generate_tasks };

  } catch (error) {
    console.error('API Error:', error);
    return { 
      success: "false", 
      // @ts-ignore
      error: error.message 
    };
  }
};


// Utility function to convert image to base64
const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to process image');
  }
};

export const useFetchAiGoals = async (userMessage: string, goals?: Goal[], uri?: string | null) => {
  try {
    const openai = new OpenAI({ 
      apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY 
    });

    // Base messages array
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a goal-setting assistant. Your job is to help create meaningful goals with milestones. Each goal should include a title, description, due date, category, and relevant milestones. Goals should be SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Reply in the prompt language.`
      },
      {
        role: "system",
        content: `startDate and dueDate should be in ISO format. The start date should not be before the date of sending request.`
      }
    ];

    // Add text content
    if (userMessage.trim().length > 0) {
      messages.push({
        role: "user", 
        content: [{
          type: "text",
          text: `Here is the goal request: ${userMessage} Please create detailed goals with appropriate milestones. Consider breaking down the goals into achievable milestones with realistic timeframes.`
        }]
      });
    }

    // Add image content if provided
    if (uri) {
      try {
        const base64Image = await imageToBase64(uri);
        messages.push({
          role: "user",
          content: [
            { type: "text", text: "Create goals based on this image:" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            }
          ],
        } as ChatCompletionMessageParam);
      } catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Failed to process image input');
      }
    }

    // Create completion with parsed response
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4-vision-preview",
      messages,
      functions: [{
        name: "generate_goals",
        parameters: {
          previous_goals: goals,
          current_date: (new Date()).toISOString()
        }
      }],
      response_format: zodResponseFormat(z.object({ 
        goals: z.array(GoalSchema) 
      }), "goal"),
    });

    const generate_goals = completion.choices[0].message.parsed as unknown as { goals: Goal[] };
    return { success: "true", data: generate_goals };

  } catch (error) {
    console.error('API Error:', error);
    return { 
      success: "false", 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};