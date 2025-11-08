import { withAuth, WithAuthProps } from "@/domains/core/auth";
import { Feature, isFeatureAvailable } from "@/domains/core/feature-flags";
import { getQuota } from "@/domains/core/feature-flags/server";

const DemoPage = async ({user}:WithAuthProps) => {  
  return <>
    <h1>Demo private page {user.name}</h1>

    {await isFeatureAvailable(Feature.MATERIALS) && (
      <p>{await getQuota(Feature.MATERIALS)} Materials feature is available for your plan.</p>
    )}
  </>;
}

export default withAuth(DemoPage);