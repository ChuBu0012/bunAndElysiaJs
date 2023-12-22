import { Elysia, t } from "elysia";
import {
  createBook,
  createUser,
  deleteBook,
  getBook,
  getBooks,
  getUser,
  updateBook,
} from "./model";
import jwt from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import { request } from "http";
import { headers } from "next/dist/client/components/headers";

const app = new Elysia();

app
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECET,
    })
  )
  .use(cookie())
  .derive(async ({ jwt, cookie: { token } }) => {
    const profile = await jwt.verify(token);
    return {
      profile,
    };
  });

// Books
app.guard(
  {
    beforeHandle: ({ set, profile }: any) => {
      console.log("before Router");

      if (!profile) {
        set.status = 401;
        return "Unauthorized";
      }
    },
  },
  (app) => {
    app.get("/books", () => getBooks());

    app.get("/books/:id", async ({ params, jwt, cookie: { token } }: any) => {
      getBook(parseInt(params.id));
    });

    app.post(
      "/books",
      ({ body, set }: any) => {
        const res = createBook({
          name: body.name,
          author: body.author,
          price: body.price,
        });
        if (res.error) {
          set.status = 400;
          return { message: "insert incomplete!" };
        }
        return { message: "ok" };
      },
      {
        body: t.Object({
          name: t.String(),
          author: t.String(),
          price: t.Number(),
        }),
      }
    );

    app.put("/books/:id", ({ body, set, params }: any) => {
      try {
        const bookId: number = params.id;
        const res = updateBook(bookId, {
          name: body.name,
          author: body.author,
          price: body.price,
        });
        if (res.error) {
          set.status = 400;
          return { message: "insert incomplete!" };
        }
        return { message: "ok" };
      } catch (error) {
        set.status = 500;
        return { message: "error somethingWrong" };
      }
    });

    app.delete("/books/:id", ({ params }) => {
      const bookId: number = parseInt(params.id);
      deleteBook(bookId);
      return { message: `Delete Id : ${bookId}` };
    });

    return app;
  }
);
// User Api
app.post(
  "/register",
  async ({ body, set }: any) => {
    try {
      let userData: any = body;
      userData.password = await Bun.password.hash(userData.password, {
        algorithm: "bcrypt",
        cost: 4,
      });
      createUser(userData);
      return {
        message: "Create User Successful!",
      };
    } catch (error) {
      set.status = 500;
      return {
        message: "error",
        error,
      };
    }
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  }
);

app.post(
  "/login",
  async ({ body, set, jwt, cookie, setCookie }: any) => {
    try {
      let userData = body;
      const res = await getUser(userData);
      if (!res.loggedIng) {
        set.status = 403;
        return {
          message: "login fail",
        };
      }
      setCookie(
        "token",
        await jwt.sign({
          email: userData.email,
        }),
        {
          httpOnly: true,
          maxAge: 7 * 86400,
        }
      );
      return { message: "Login Sucessful!", auth: cookie.token };
    } catch (error) {
      set.status = 500;
      return {
        message: "error",
        error,
      };
    }
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  }
);
app.listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
