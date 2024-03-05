import PasskeySection from '@/components/sections/passkey'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Session keys demo</CardTitle>
        </CardHeader>
        <CardContent>
          <PasskeySection />
        </CardContent>
      </Card>
    </div>
  )
}
