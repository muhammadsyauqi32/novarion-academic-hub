import { redirect } from 'next/navigation';

export default function GroupsRedirectPage() {
  redirect('/admin/whatsapp?tab=groups');
}
