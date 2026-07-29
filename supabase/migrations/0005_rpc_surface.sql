-- Nummi — mempersempit permukaan RPC yang lahir dari 0004.
--
-- Membuat `auth_family_id()` & `can_see_child()` jadi SECURITY DEFINER (0004) menyelesaikan
-- rekursi RLS, tapi menimbulkan efek samping: PostgREST mengekspos setiap fungsi di schema
-- `public` sebagai /rest/v1/rpc/<nama>. Fungsi definer yang bisa dipanggil tanpa login adalah
-- hal yang pantas ditanyakan advisor.
--
-- Keduanya tidak membocorkan data — untuk anon, `auth_family_id()` mengembalikan null dan
-- `can_see_child()` selalu false. Tapi anon memang tidak pernah membutuhkannya: Edge Function
-- `child-login` menerbitkan JWT ber-`role: authenticated` (functions/child-login/index.ts:72),
-- dan ortu memakai Supabase Auth. Tidak ada satu pun jalur sah yang memanggilnya sebagai anon.

revoke execute on function auth_family_id()            from public, anon;
revoke execute on function can_see_child(uuid)         from public, anon;

grant execute on function auth_family_id()            to authenticated, service_role;
grant execute on function can_see_child(uuid)         to authenticated, service_role;

-- YANG SENGAJA DIBIARKAN: advisor akan tetap melaporkan bahwa `authenticated` boleh memanggil
-- keduanya. Itu BUKAN kelalaian — policy di 0002_rls.sql dievaluasi sebagai role pemanggil,
-- jadi mencabut EXECUTE dari `authenticated` akan mematikan seluruh RLS-nya. Menghilangkan
-- peringatan itu butuh memindahkan helper ke schema non-publik (mis. `nummi_auth`) dan menulis
-- ulang semua policy yang merujuknya — perubahan yang lebih besar daripada risikonya.
