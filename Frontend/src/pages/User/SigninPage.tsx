import { SigninForm } from "@/components/auth/signin-form"

const SigninPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100/80 p-4 md:p-8">
      <div className="w-full max-w-5xl">
        <SigninForm />
      </div>
    </div>
  )
}

export default SigninPage