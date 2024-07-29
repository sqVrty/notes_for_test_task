import { notFound } from "next/navigation";

import NotesBase from "./NotesBase";

const fetchData = async () => {
  const response = await fetch("http://localhost:3001/posts", {
    cache: "no-cache", // This ensures the browser fetches the latest data
  });
  const data = await response.json();
  return data;
};

export interface IPosts {
  id: string;
  title: string;
  desc: string;
  date: string;
}

export default async function Home() {
  const data: IPosts[] = await fetchData();

  if (!data) return notFound();

  return <NotesBase data={data} />;
}
