import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import NetInfo from "@react-native-community/netinfo";
import { SupabaseService } from "@/db/supabaseService";

// Types
export type NoteTag = {
  id: string;
  name: string;
  color: string;
};

export type NoteAttachment = {
  id: string;
  uri: string;
  type?: string;
  name: string;
  size?: number;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: NoteTag[];
  isPinned: boolean;
  isArchived: boolean;
  attachments?: NoteAttachment[];
  color?: string;
  lastEditedAt: string;
  createdAt: string;
};

export type NotesStore = {
  userId: string | undefined;
  notes: Note[];
  tags: NoteTag[];
  selectedNote: Note | null;
  refreshNotes: () => Promise<void>,
  // Basic note operations
  setUserId: (userId?: string) => void;
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => Promise<void>;
  updateNote: (updatedNote: Note) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  
  // Tag operations
  setTags: (tags: NoteTag[]) => void;
  addTag: (tag: NoteTag) => void;
  updateTag: (tagId: string, updatedTag: NoteTag) => void;
  deleteTag: (tagId: string) => void;
  
  // Note actions
  pinNote: (noteId: string) => void;
  archiveNote: (noteId: string) => void;
  addAttachment: (noteId: string, attachment: NoteAttachment) => void;
  deleteAttachment: (noteId: string, attachmentId: string) => void;
  
  // Selection
  setSelectedNote: (noteId: string | null) => void;
  clearSelectedNote: () => void;
  
  // Filtering and searching
  getNotesByTag: (tagId: string) => Note[];
  searchNotes: (query: string) => Note[];
  getPinnedNotes: () => Note[];
  getArchivedNotes: () => Note[];

  getNoteById: (noteId: string) => Note | undefined,
  
  // Sync operations
  backupToSupabase: () => Promise<void>;
};

// Create the store
export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      userId: undefined,
      notes: [],
      tags: [],
      selectedNote: null,
      
      refreshNotes: async () => {
        // const freshGoals = await fetch('/api/goals').then(res => res.json());
        // set({ goals: freshGoals });

        
      },

      // Basic note operations
      setUserId: (userId) => set((state) => ({ ...state, userId })),
      
      setNotes: (notes) => set({ notes }),
      
      getNoteById: (noteId) => (get().notes.find(note => note.id === noteId)),
      addNote: async (newNote) => {
        set((state) => ({ notes: [...state.notes, newNote] }));
        // Sync with Supabase if online
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected && get().userId) {
        //   const supabaseService = SupabaseService.getInstance();
        //   await supabaseService.createNote(newNote, get().userId!);
        }
      },
      
      updateNote: async (updatedNote) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === updatedNote.id ? updatedNote : note
          )
        }));
        // Sync with Supabase if online
        const netInfo = await NetInfo.fetch();
        // if (netInfo.isConnected && get().userId) {
        //   const supabaseService = SupabaseService.getInstance();
        //   await supabaseService.updateNote(updatedNote, get().userId!);
        // }
      },
      
      deleteNote: async (noteId) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== noteId)
        }));
        // Sync with Supabase if online
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected && get().userId) {
        //   const supabaseService = SupabaseService.getInstance();
        //   await supabaseService.deleteNote(noteId, get().userId!);
        }
      },

      // Tag operations
      setTags: (tags) => set({ tags }),
      
      addTag: (tag) => set((state) => ({
        tags: [...state.tags, tag]
      })),
      
      updateTag: (tagId, updatedTag) => set((state) => ({
        tags: state.tags.map((tag) =>
          tag.id === tagId ? updatedTag : tag
        )
      })),
      
      deleteTag: (tagId) => set((state) => ({
        tags: state.tags.filter((tag) => tag.id !== tagId),
        notes: state.notes.map((note) => ({
          ...note,
          tags: note.tags.filter((tag) => tag.id !== tagId)
        }))
      })),

      // Note actions
      pinNote: (noteId) => set((state) => ({
        notes: state.notes.map((note) =>
          note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
        )
      })),
      
      archiveNote: (noteId) => set((state) => ({
        notes: state.notes.map((note) =>
          note.id === noteId ? { ...note, isArchived: !note.isArchived } : note
        )
      })),
      
      addAttachment: (noteId, attachment) => set((state) => ({
        notes: state.notes.map((note) =>
          note.id === noteId
            ? { ...note, attachments: [...(note.attachments || []), attachment] }
            : note
        )
      })),
      
      deleteAttachment: (noteId, attachmentId) => set((state) => ({
        notes: state.notes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                attachments: note.attachments?.filter((att) => att.id !== attachmentId)
              }
            : note
        )
      })),

      // Selection
      setSelectedNote: (noteId) => set((state) => ({
        selectedNote: state.notes.find((note) => note.id === noteId) || null
      })),
      
      clearSelectedNote: () => set({ selectedNote: null }),

      // Filtering and searching
      getNotesByTag: (tagId) => {
        return get().notes.filter((note) =>
          note.tags.some((tag) => tag.id === tagId)
        );
      },
      
      searchNotes: (query) => {
        const searchTerm = query.toLowerCase();
        return get().notes.filter(
          (note) =>
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm)
        );
      },
      
      getPinnedNotes: () => get().notes.filter((note) => note.isPinned),
      
      getArchivedNotes: () => get().notes.filter((note) => note.isArchived),

      // Sync operations
      backupToSupabase: async () => {
        try {
          const { notes, userId } = get();
          if (!userId) return;
          
          const netInfo = await NetInfo.fetch();
          if (netInfo.isConnected) {
            // const supabaseService = SupabaseService.getInstance();
            // await supabaseService.backupNotes(notes, userId);
          }
        } catch (error) {
          console.error('Error backing up notes to Supabase:', error);
        }
      },
    }),
    {
      name: 'notes-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
