-- Trigger functions run internally. They are not public REST RPC endpoints.
REVOKE EXECUTE ON FUNCTION public.buyer_relation_agency(text,uuid) FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.buyer_relation_guard() FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_agency_signup() FROM PUBLIC,anon,authenticated;
