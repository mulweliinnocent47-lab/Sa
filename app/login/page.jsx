'use client'
import { AppShell } from "@/components/AppShell"
import Input from "@/components2/input.jsx"
import Button from "@/components2/button.jsx"
import Link from "next/link"
import {useState} from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter()
    const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const handleLogin = async (e) =>{
    e.preventDefault()
    if(!email || !password){
        alert("your form is invalid")
        return     
    }
    
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
     email,
     password,
    });
    if(error){
      console.error(error)
      alert(`Couldn't log in: ${error.message}`)
      return
    }
      // Go back to the page that asked for sign-in (same-site paths only)
      const next = new URLSearchParams(window.location.search).get("next")
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/")
      router.refresh()
  }
  return (
    <AppShell>
    <div className="flex justify-center py-6 md:py-12">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
        <h1 className="text-center text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">Log in to continue studying.</p>

        <Input must={true} pro="Email" id="email" type="email" logic={(e) => {setEmail(e.target.value)}} value="Enter your email" />
        <Input must={true} pro="Password" id="password"  logic={(e) => {setPassword(e.target.value)}}  type="password" value="Enter your password" />

        <Button info="Log in" type="submit" />

        <div className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href={`/signup${typeof window !== "undefined" ? window.location.search : ""}`} className="font-semibold text-primary underline">Sign up</Link>
          </p>
        </div>
      </form>
    </div>
    </AppShell>
  )
}
