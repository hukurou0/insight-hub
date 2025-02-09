export const fetchWithMinDuration = async <T>(
  fetchFn: () => Promise<T>,
  minDuration: number = 200
): Promise<T> => {
  const startTime = Date.now();
  const result = await fetchFn();
  
  const elapsedTime = Date.now() - startTime;
  if (elapsedTime < minDuration) {
    await new Promise(resolve => setTimeout(resolve, minDuration - elapsedTime));
  }
  
  return result;
}; 