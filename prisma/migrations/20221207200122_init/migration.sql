-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "postquantity" INTEGER,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentario" (
    "id" SERIAL NOT NULL,
    "mensagem" VARCHAR(255),
    "users_id" INTEGER NOT NULL,
    "post_id" INTEGER,

    CONSTRAINT "comentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "mensagem" VARCHAR(255) NOT NULL,
    "users_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "id" SERIAL NOT NULL,
    "refresh_tk" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "access_expires_in" VARCHAR(255) NOT NULL,
    "refresh_expires_in" VARCHAR(255) NOT NULL,
    "users_id" INTEGER NOT NULL,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email" ON "users"("email");

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comentario" ADD CONSTRAINT "comentario_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
