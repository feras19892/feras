import { useRouter } from 'vue-router'

export function useGoToBranch() {
  const router = useRouter()

  function goToBranch(branchId: string) {
    if (branchId === 'physics') router.push('/physics')
    if (branchId === 'chemistry') router.push('/chemistry')
    if (branchId === 'mathematics') router.push('/math')
    if (branchId === 'general') router.push('/biology')
  }

  return { goToBranch }
}
