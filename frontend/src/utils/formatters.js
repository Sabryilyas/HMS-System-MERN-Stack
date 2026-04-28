export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "0 LKR";
  return `${Math.round(amount).toLocaleString('en-US')} LKR`;
}

export const formatCurrencyShort = (amount) => {
  if (!amount && amount !== 0) return "LKR 0";
  return `LKR ${Math.round(amount).toLocaleString('en-US')}`;
}

export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, "")
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

export const truncateText = (text, length) => {
  if (text.length <= length) return text
  return text.substring(0, length) + "..."
}

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
