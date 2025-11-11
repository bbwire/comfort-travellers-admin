export const useFirebase = () => {
  const { $firebase } = useNuxtApp()
  return $firebase
}

