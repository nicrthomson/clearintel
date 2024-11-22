import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface User {
  id: number
  name: string | null
  email: string
}

interface OrganizationUsers {
  currentUser: {
    id: number
    name: string | null
  }
  users: User[]
}

export function useOrganizationUsers() {
  const { data: session } = useSession()
  const [orgUsers, setOrgUsers] = useState<OrganizationUsers | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/users/organization')
        if (!response.ok) throw new Error('Failed to fetch users')
        const data = await response.json()
        
        // Ensure data has the expected structure
        if (!data || !data.currentUser || !Array.isArray(data.users)) {
          throw new Error('Invalid response format')
        }
        
        setOrgUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users')
        console.error('Error fetching organization users:', err)
        // Initialize with empty arrays to prevent map errors
        setOrgUsers({
          currentUser: {
            id: 0,
            name: null
          },
          users: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchUsers()
    }
  }, [session])

  const getUserDisplayName = (user: User) => {
    return user.name || user.email.split('@')[0]
  }

  return {
    orgUsers,
    isLoading,
    error,
    getUserDisplayName,
  }
}
