import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { MessagesSquareIcon } from 'lucide-react'
import Link from 'next/link'


const Home = () => {
  return (
    <div className='container mx-atuo max-w-3xl px-4 py-8 space-y-8'>
      <Empty className='border border-dashed'>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessagesSquareIcon />
          </EmptyMedia>
          <EmptyTitle>No Chat Yet</EmptyTitle>
          <EmptyDescription>
            Create a new chat room to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <Link href="rooms/new">Create Room</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

export default Home