import { Database } from "bun:sqlite";

const db = new Database("mydb.sqlite");
// CRUD BOOKs
const getBooks = () => {
  try {
    const query = db.query(`SELECT * FROM books;`);
    return query.all();
  } catch (error) {
    console.log(error, "error");
    return [];
  }
};
const getBook = (id: number) => {
  try {
    const query = db.query(`SELECT * FROM books WHERE id = $id;`);
    return query.get({ $id: id });
  } catch (error) {
    console.log(error, "error");
    return {};
  }
};
const createBook = (book: any) => {
  try {
    if (!book.name || !book.author || !book.price) {
      throw new Error("Vaildation Fail!");
    }
    const query = db.query(`
    INSERT INTO books ("name", "author", "price")
    VALUES ($name,$author,$price);
    `);
    query.run({
      $name: book.name,
      $author: book.author,
      $price: book.price,
    });
    return { status: "ok" };
  } catch (error) {
    console.log(error, "error");
    return { status: "error", error };
  }
};
const updateBook = (id: number, book: any) => {
  try {
    const query = db.query(
      `UPDATE books SET "name"=$name, "author"=$author, "price"=$price WHERE id=$id`
    );
    query.run({
      $id: id,
      $name: book.name,
      $author: book.author,
      $price: book.price,
    });
    return { status: "ok" };
  } catch (error) {
    console.log(error, "error");
    return { status: "error", error };
  }
};
const deleteBook = (id: number) => {
  try {
    const query = db.query(`DELETE FROM books WHERE id=$id`);
    query.run({
      $id: id,
    });
    return { status: "ok" };
  } catch (error) {
    console.log(error, "error");
    return { status: "error", error };
  }
};

// Crud User
const createUser = (user: any) => {
  try {
    const query = db.query(`
      INSERT INTO users ("email", "password")
      VALUES ($email,$password);
      `);
    query.run({
      $email: user.email,
      $password: user.password,
    });
  } catch (error) {
    console.log(error, "error");
  }
};

const getUser = async (user: any) => {
  try {
    const query = db.query(`SELECT * FROM users WHERE email = $email;`);
    const userData: any = query.get({
      $email: user.email,
    });
    if (!userData) throw new Error("User not found!");

    const isMatch = await Bun.password.verify(user.password, userData.password);

    if (!isMatch) throw new Error("User inVaild!");
    return {
      loggedIng: true,
    };
  } catch (error) {
    console.log(error, "error");
    return {
      loggedIng: false,
    };
  }
};

export {
  getBook,
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  createUser,
  getUser,
};
