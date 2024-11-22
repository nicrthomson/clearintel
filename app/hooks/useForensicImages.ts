import useSWR from "swr"
import { fetcher } from "@/lib/utils"

export interface ForensicImage {
  id: number
  name: string
  description: string | null
  imageType: string
  symlinkPath: string
  size: number
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

export function useForensicImages(caseId: number) {
  const { data, error, mutate } = useSWR<ForensicImage[]>(
    `/api/cases/${caseId}/images`,
    fetcher
  )

  return {
    images: data || [],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  }
}
