import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/reception');
  return null;
}
