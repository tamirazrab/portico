import AuthLayoutView from "@/app/[lang]/(auth)/view/auth-layout.view";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <AuthLayoutView>
            {children}
        </AuthLayoutView>
    );
};

export default Layout;

