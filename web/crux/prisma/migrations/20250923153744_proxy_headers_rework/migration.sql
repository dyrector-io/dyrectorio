ALTER TABLE "ContainerConfig"  RENAME    "proxyHeaders" TO "proxyBuffering";
ALTER TABLE "ContainerConfig"  RENAME "customHeaders" TO "corsHeaders";
ALTER TABLE "ContainerConfig" ADD COLUMN     "proxyHeaders" JSONB;
