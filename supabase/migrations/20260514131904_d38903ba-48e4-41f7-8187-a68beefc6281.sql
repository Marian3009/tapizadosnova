
insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

create policy "Public read blog-media"
on storage.objects for select
to public
using (bucket_id = 'blog-media');

create policy "Admins manage blog-media"
on storage.objects for all
to authenticated
using (bucket_id = 'blog-media' and has_role(auth.uid(), 'admin'))
with check (bucket_id = 'blog-media' and has_role(auth.uid(), 'admin'));
