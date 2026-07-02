
-- Profile RLS policies
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins update any profile" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- handle_new_user is trigger-only, executed by postgres role; no grants needed
