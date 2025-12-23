export type ItemPreview = {
  id: string;
  name: string;
  iconLink: string | null;
};

export type ItemDetails = {
  id: string;
  name: string;
  description: string | null;
  avg24hPrice: number | null;
  height: number | null;
  width: number | null;
  iconLink: string | null;
  image512pxLink: string | null;
  wikiLink?: string | null;
};

export type TrackedItem = {
  id: string;
  iconLink: string | null;
  updatedAt: number;
};
