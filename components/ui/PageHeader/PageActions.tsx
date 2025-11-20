const PageDescription = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="text-muted-foreground hidden md:block">
            {children}
        </div>
    );
};

export default PageDescription;