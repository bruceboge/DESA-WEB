export interface NewsFormDraft {
  title: string;
  type: "event" | "news";
  eventDate: string;
  date: string;
  location: string;
  coverImage: string;
  excerpt: string;
  content: string;
}

export interface GalleryFormDraft {
  title: string;
  category: string;
  department: string;
  location: string;
  date: string;
  description: string;
  image: string;
}
