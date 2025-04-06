export const isStatus = (diploma, statusId) => {
    const currentStatus = diploma.history?.hist?.[diploma.history.hist.length - 1]?.status || 1;
    return currentStatus === statusId;
  };
  