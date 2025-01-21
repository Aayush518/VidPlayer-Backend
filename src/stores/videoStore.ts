import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  description: string | null;
  user_id: string;
  created_at: string;
}

interface VideoState {
  videos: Video[];
  isLoading: boolean;
  fetchVideos: () => Promise<void>;
  addVideo: (video: Omit<Video, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
}

export const useVideoStore = create<VideoState>((set) => ({
  videos: [],
  isLoading: false,
  fetchVideos: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    set({ videos: data || [], isLoading: false });
  },
  addVideo: async (video) => {
    const { error } = await supabase
      .from('videos')
      .insert([video]);
    
    if (error) throw error;
  },
  deleteVideo: async (id) => {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
}));