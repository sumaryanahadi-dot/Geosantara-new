export const getWishlist = () => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("wishlist") || "[]");
};

export const toggleWishlist = (item: any) => {
  if (typeof window === "undefined") return;

  let list = JSON.parse(localStorage.getItem("wishlist") || "[]");
  const exists = list.find((x: any) => x.id === item.id);

  if (exists) {
    list = list.filter((x: any) => x.id !== item.id);
  } else {
    list.push(item);
  }

  localStorage.setItem("wishlist", JSON.stringify(list));
};

export const isWishlisted = (id: number) => {
  if (typeof window === "undefined") return false;
  let list = JSON.parse(localStorage.getItem("wishlist") || "[]");
  return list.some((x: any) => x.id === id);
};
