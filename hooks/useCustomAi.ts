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
  data: { tasks : Task[]}
} | {
  success: "false"
  error: string
}



export const fetchChatCompletion = async (apiKey: string, userMessage: string) :Promise<ResponseData>  => {
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
      return { error: err.message };
    }
  };