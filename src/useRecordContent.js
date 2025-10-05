import { useState, useEffect } from 'react';

export const useRecordContent = (event) => {
  const [recordContent, setRecordContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset states
    setIsLoading(false);
    setError(null);
    setRecordContent(null);

    // Extract record content directly from the event
    if (!event?.data?.ops?.[0]) return;

    const op = event.data.ops[0];
    
    // The record content is already included in the WebSocket event!
    if (op.record) {
      setRecordContent(op.record);
    }
  }, [event]);

  return { recordContent, isLoading, error };
};