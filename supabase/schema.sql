-- ============================================================
-- TOORO MUSIC — Supabase SQL Schema
-- Run this in your Supabase SQL Editor after creating a project
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  username text unique,
  avatar_url text,
  bio text,
  is_artist boolean default false,
  is_admin boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ARTISTS
-- ============================================================
create table public.artists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text unique not null,
  bio text,
  avatar_url text,
  cover_url text,
  genre text,
  location text default 'Tooro Kingdom, Uganda',
  verified boolean default false,
  followers_count integer default 0,
  monthly_listeners integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- GENRES
-- ============================================================
create table public.genres (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  slug text unique not null,
  cover_url text,
  color text,
  created_at timestamp with time zone default now()
);

insert into public.genres (name, slug, color) values
  ('Afrobeat', 'afrobeat', '#FF6B35'),
  ('Amapiano', 'amapiano', '#9B59B6'),
  ('Gospel', 'gospel', '#F39C12'),
  ('Hip Hop', 'hiphop', '#E74C3C'),
  ('Traditional', 'traditional', '#27AE60'),
  ('R&B', 'rnb', '#3498DB'),
  ('Dancehall', 'dancehall', '#E91E63'),
  ('Pop', 'pop', '#00BCD4');

-- ============================================================
-- SONGS
-- ============================================================
create table public.songs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  artist_id uuid references public.artists(id) on delete cascade not null,
  genre_id uuid references public.genres(id) on delete set null,
  audio_url text not null,
  cover_url text,
  duration integer, -- in seconds
  plays_count integer default 0,
  likes_count integer default 0,
  is_premium boolean default false,
  is_published boolean default false,
  lyrics text,
  release_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- ALBUMS
-- ============================================================
create table public.albums (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  artist_id uuid references public.artists(id) on delete cascade not null,
  cover_url text,
  release_date date,
  genre_id uuid references public.genres(id) on delete set null,
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

create table public.album_songs (
  album_id uuid references public.albums(id) on delete cascade,
  song_id uuid references public.songs(id) on delete cascade,
  track_number integer,
  primary key (album_id, song_id)
);

-- ============================================================
-- PLAYLISTS
-- ============================================================
create table public.playlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  cover_url text,
  is_public boolean default true,
  songs_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table public.playlist_songs (
  playlist_id uuid references public.playlists(id) on delete cascade,
  song_id uuid references public.songs(id) on delete cascade,
  position integer,
  added_at timestamp with time zone default now(),
  primary key (playlist_id, song_id)
);

-- ============================================================
-- LIKES & FOLLOWS
-- ============================================================
create table public.song_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  song_id uuid references public.songs(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, song_id)
);

create table public.artist_follows (
  user_id uuid references public.profiles(id) on delete cascade,
  artist_id uuid references public.artists(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, artist_id)
);

-- ============================================================
-- PLAY HISTORY
-- ============================================================
create table public.play_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  song_id uuid references public.songs(id) on delete cascade,
  played_at timestamp with time zone default now(),
  duration_played integer -- seconds actually listened
);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('songs', 'songs', true),
  ('covers', 'covers', true),
  ('avatars', 'avatars', true);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.songs enable row level security;
alter table public.albums enable row level security;
alter table public.playlists enable row level security;
alter table public.song_likes enable row level security;
alter table public.artist_follows enable row level security;
alter table public.play_history enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Artists: anyone can read
create policy "Artists are viewable by everyone"
  on public.artists for select using (true);
create policy "Artists can update own record"
  on public.artists for update using (auth.uid() = user_id);

-- Songs: anyone can read published songs
create policy "Published songs are viewable by everyone"
  on public.songs for select using (is_published = true);
create policy "Artists can manage own songs"
  on public.songs for all using (
    artist_id in (select id from public.artists where user_id = auth.uid())
  );

-- Playlists: public playlists viewable by all, private only by owner
create policy "Public playlists viewable by everyone"
  on public.playlists for select using (is_public = true or user_id = auth.uid());
create policy "Users can manage own playlists"
  on public.playlists for all using (user_id = auth.uid());

-- Song likes
create policy "Users can manage own likes"
  on public.song_likes for all using (user_id = auth.uid());

-- Artist follows
create policy "Users can manage own follows"
  on public.artist_follows for all using (user_id = auth.uid());

-- Play history
create policy "Users can manage own history"
  on public.play_history for all using (user_id = auth.uid());

-- ============================================================
-- STORAGE POLICIES
-- ============================================================
create policy "Public read for songs"
  on storage.objects for select using (bucket_id = 'songs');
create policy "Authenticated upload for songs"
  on storage.objects for insert with check (bucket_id = 'songs' and auth.role() = 'authenticated');

create policy "Public read for covers"
  on storage.objects for select using (bucket_id = 'covers');
create policy "Authenticated upload for covers"
  on storage.objects for insert with check (bucket_id = 'covers' and auth.role() = 'authenticated');

create policy "Public read for avatars"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "Users upload own avatar"
  on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index songs_artist_id_idx on public.songs(artist_id);
create index songs_genre_id_idx on public.songs(genre_id);
create index songs_plays_count_idx on public.songs(plays_count desc);
create index play_history_user_id_idx on public.play_history(user_id);
create index play_history_played_at_idx on public.play_history(played_at desc);
create index artist_follows_user_id_idx on public.artist_follows(user_id);
create index song_likes_user_id_idx on public.song_likes(user_id);
