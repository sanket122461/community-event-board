import AuthForm from "@/components/AuthForm";

export default function AdminLoginPage() {
  const showLocalCredentials =
    process.env.NODE_ENV !== "production" &&
    !process.env.ADMIN_EMAIL &&
    !process.env.ADMIN_PASSWORD;

  return <AuthForm mode="admin" showLocalCredentials={showLocalCredentials} />;
}
