import PasskeySection from '@/components/sections/passkey'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="w-3/4 sm:w-1/2 md:w-1/4 flex flex-col gap-3">
      <PasskeySection />
    </div>
  )
}
