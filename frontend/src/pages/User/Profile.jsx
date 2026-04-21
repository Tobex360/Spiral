import React, { useEffect, useState } from 'react'
import User from '../../assets/no_avatar.webp'
import { Button } from 'antd';



function Profile() {
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");



    useEffect(()=>{
        const user = localStorage.getItem('user')
        if(user){
            const userdata = JSON.parse(user)
            setUsername(userdata.username || 'User')
        }
    },[])


  return (
    <>
        <main className='min-h-screen pb-16'>
            <div className='flex flex-col px-40 pt-20 font-audiowide'>
                <div className='flex items-center gap-3'>
                    <div className='w-[80] h-auto border-r-[50%] overflow-hidden'>
                        <img src={User} alt="" className='w-[100%] h-auto object-cover'/>
                    </div>
                    <div className='flex flex-col gap-2 justify-start'>
                        <div className='text-2xl'>{username}</div>
                        <Button
                        
                        className='bg-primary border-primary font-tomorrow hover:bg-transparent hover:text-primary hover:border-primary'
                        >Edit Profile</Button>
                    </div>

                </div>
           </div> 
        </main>
    </>
  )
}

export default Profile