import { SignupForm } from "../components/auth/signup-form"


const SignupPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100/80 p-4 md:p-8">
      <div className="w-full max-w-5xl">
        <SignupForm />
      </div>
    </div>
  )
}

export default SignupPage