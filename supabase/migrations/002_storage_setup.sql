-- Private buyer buckets. Client portal uploads require a server route or signed upload URL.
INSERT INTO storage.buckets(id,name,public) VALUES ('uploads','uploads',false),('contracts','contracts',false) ON CONFLICT(id) DO UPDATE SET public=false;
-- Deliberately no anonymous storage access or cross-tenant deletion policies.
-- Server-side admin access must validate the authenticated agency or portal token.
