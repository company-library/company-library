SET check_function_bodies = false;
CREATE TABLE public.books (
    id integer NOT NULL,
    title text NOT NULL,
    isbn character varying(13) NOT NULL,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;
CREATE TABLE public.impressions (
    id integer NOT NULL,
    book_id integer NOT NULL,
    user_id integer NOT NULL,
    impression text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.impressions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.impressions_id_seq OWNED BY public.impressions.id;
CREATE TABLE public.lending_histories (
    id integer NOT NULL,
    book_id integer NOT NULL,
    user_id integer NOT NULL,
    due_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.lending_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.lending_histories_id_seq OWNED BY public.lending_histories.id;
CREATE TABLE public.registration_histories (
    id integer NOT NULL,
    book_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.registration_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.registration_histories_id_seq OWNED BY public.registration_histories.id;
CREATE TABLE public.reservations (
    id integer NOT NULL,
    book_id integer NOT NULL,
    user_id integer NOT NULL,
    reservation_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.reservations_id_seq OWNED BY public.reservations.id;
CREATE TABLE public.return_histories (
    id integer NOT NULL,
    lending_history_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.return_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.return_histories_id_seq OWNED BY public.return_histories.id;
CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);
ALTER TABLE ONLY public.impressions ALTER COLUMN id SET DEFAULT nextval('public.impressions_id_seq'::regclass);
ALTER TABLE ONLY public.lending_histories ALTER COLUMN id SET DEFAULT nextval('public.lending_histories_id_seq'::regclass);
ALTER TABLE ONLY public.registration_histories ALTER COLUMN id SET DEFAULT nextval('public.registration_histories_id_seq'::regclass);
ALTER TABLE ONLY public.reservations ALTER COLUMN id SET DEFAULT nextval('public.reservations_id_seq'::regclass);
ALTER TABLE ONLY public.return_histories ALTER COLUMN id SET DEFAULT nextval('public.return_histories_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_isbn_key UNIQUE (isbn);
ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.impressions
    ADD CONSTRAINT impressions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.lending_histories
    ADD CONSTRAINT lending_histories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.registration_histories
    ADD CONSTRAINT registration_histories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.return_histories
    ADD CONSTRAINT return_histories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.impressions
    ADD CONSTRAINT impressions_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.impressions
    ADD CONSTRAINT impressions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.lending_histories
    ADD CONSTRAINT lending_histories_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.lending_histories
    ADD CONSTRAINT lending_histories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.registration_histories
    ADD CONSTRAINT registration_histories_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.registration_histories
    ADD CONSTRAINT registration_histories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.return_histories
    ADD CONSTRAINT return_histories_lending_history_id_fkey FOREIGN KEY (lending_history_id) REFERENCES public.lending_histories(id) ON UPDATE CASCADE ON DELETE CASCADE;
