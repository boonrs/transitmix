--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: lines; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE lines (
    name text,
    description text,
    start_time text,
    end_time text,
    frequency integer,
    speed integer,
    color text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    coordinates text,
    map_id integer,
    id integer NOT NULL
);


--
-- Name: lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE lines_id_seq OWNED BY lines.id;


--
-- Name: maps; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE maps (
    id integer NOT NULL,
    name text,
    center text,
    zoom_level integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: maps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE maps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: maps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE maps_id_seq OWNED BY maps.id;


--
-- Name: schema_info; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE schema_info (
    version integer DEFAULT 0 NOT NULL
);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY lines ALTER COLUMN id SET DEFAULT nextval('lines_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY maps ALTER COLUMN id SET DEFAULT nextval('maps_id_seq'::regclass);


--
-- Name: lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY lines
    ADD CONSTRAINT lines_pkey PRIMARY KEY (id);


--
-- Name: maps_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY maps
    ADD CONSTRAINT maps_pkey PRIMARY KEY (id);


--
-- Name: lines_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY lines
    ADD CONSTRAINT lines_map_id_fkey FOREIGN KEY (map_id) REFERENCES maps(id);


--
-- PostgreSQL database dump complete
--

