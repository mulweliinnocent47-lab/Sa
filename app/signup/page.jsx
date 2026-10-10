"use client"

import { AppShell } from "@/components/AppShell"
import Input from "@/components2/input.jsx"
import Button from "@/components2/button.jsx"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import {useState,useEffect} from "react"
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirm, setConfirm] = useState("")
  
  const handleSingUp = async (e) =>{
    e.preventDefault()
    if(confirm != password || name === "" || password === "" || confirm === "" || email === ""){
        alert("your form is invalid")
        return 
      }
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({email,password,
      options: {
      data: { name } }
      })
      if(error){
        alert(`Error while signing up: ${error.message}`)
        return
      }
      alert("Account created — please log in.")
      router.push(`/login${window.location.search}`)
    }
  
  

  return (
    <AppShell>
    <div className="flex justify-center py-6 md:py-12">
      <form onSubmit={handleSingUp} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
        <h1 className="text-center text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">Join SA Student — it's free.</p>

        <Input must={true} logic={ (e) => {setName(e.target.value)}} pro="Username" id="name" type="text" value="Enter your username" />
        <Input must={true}  logic={ (e) => {setEmail(e.target.value)}}  pro="Email" id="email" type="email" value="Enter your email" />
        <Input must={true}  logic={ (e) => {setPassword(e.target.value)}} pro="Password" id="password" type="password" value="Enter your password" />
        <Input must={true}  logic={ (e) => {setConfirm(e.target.value)}} pro="Confirm password" id="confirm" type="password" value="Confirm password" />

        <Button info="Sign up"  type="submit" />

        <div className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={`/login${typeof window !== "undefined" ? window.location.search : ""}`} className="font-semibold text-primary underline">Log in</Link>
          </p>
        </div>
      </form>
    </div>
    </AppShell>
  )
}
