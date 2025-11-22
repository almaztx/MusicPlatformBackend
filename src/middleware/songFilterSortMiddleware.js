const songFilterSortMiddleware = (req, res, next) => {
  // Фильтр по жанру
  req.genre = req.query.genre?.trim() || null;

  // Сортировка только по title
  if (req.query.sort === "title") {
    req.orderBy = "title ASC";
  } else if (req.query.sort === "-title") {
    req.orderBy = "title DESC";
  } else {
    req.orderBy = "id ASC";
  }

  next();
};

export default songFilterSortMiddleware;
