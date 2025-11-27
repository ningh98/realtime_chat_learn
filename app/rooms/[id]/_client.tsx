"use client"

import { ChatInput } from "@/components/chat-input"
import { Message } from "@/services/supabase/actions/messages"

export function RoomClient({
    room,
    user,
    messages
}: {
    room: {
        id: string,
        name: string,
    }
    user:{
        id: string,
        name: string,
        image_url: string | null
    }
    messages: Message[]
}){
    return (
        <div className="container mx-auto h-screen-with-header border border-y-0 flex flex-col">
            <div className="flex items-center justify-between gap-2">
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold">{room.name}</h1>
                    {/* TODO make real data */}
                    <p className="text-muted-foreground text-sm">
                        0 users online
                    </p>
                    <InviteUseerModal roomId={room.id} />
                </div>
            </div>
            <div className="grow overflow-y-auto flex flex-col-reverse"
                style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "var(--border) transparent"
                }}
            >
                <div>
                    {messages.map((message)=> (
                        <ChatMessage key={message.id} {...message} />
                    ))}
                </div>
                <ChatInput roomId={room.id}/>
            </div>
        </div>
    )
}

function InviteUseerModal({
    roomId
}: {
    roomId: string
}) {
    return null
}

function ChatMessage(){
    return null
}