import { Card, CardContent } from "../card";

const PageContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card>
        <CardContent>{children}</CardContent>
    </Card>
  );
};

export default PageContent;