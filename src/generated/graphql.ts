export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  date: any;
  timestamptz: any;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']>;
  _gt?: InputMaybe<Scalars['Int']>;
  _gte?: InputMaybe<Scalars['Int']>;
  _in?: InputMaybe<Array<Scalars['Int']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['Int']>;
  _lte?: InputMaybe<Scalars['Int']>;
  _neq?: InputMaybe<Scalars['Int']>;
  _nin?: InputMaybe<Array<Scalars['Int']>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']>;
  _gt?: InputMaybe<Scalars['String']>;
  _gte?: InputMaybe<Scalars['String']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']>;
  _in?: InputMaybe<Array<Scalars['String']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']>;
  _lt?: InputMaybe<Scalars['String']>;
  _lte?: InputMaybe<Scalars['String']>;
  _neq?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']>;
  _nin?: InputMaybe<Array<Scalars['String']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']>;
};

/** columns and relationships of "books" */
export type Books = {
  __typename?: 'books';
  createdAt: Scalars['timestamptz'];
  id: Scalars['Int'];
  imageUrl: Scalars['String'];
  /** An array relationship */
  impressions: Array<Impressions>;
  /** An aggregate relationship */
  impressions_aggregate: Impressions_Aggregate;
  isbn: Scalars['String'];
  /** An array relationship */
  lending_histories: Array<LendingHistories>;
  /** An aggregate relationship */
  lending_histories_aggregate: LendingHistories_Aggregate;
  /** An array relationship */
  registration_histories: Array<RegistrationHistories>;
  /** An aggregate relationship */
  registration_histories_aggregate: RegistrationHistories_Aggregate;
  /** An array relationship */
  reservations: Array<Reservations>;
  /** An aggregate relationship */
  reservations_aggregate: Reservations_Aggregate;
  title: Scalars['String'];
};


/** columns and relationships of "books" */
export type BooksImpressionsArgs = {
  distinct_on?: InputMaybe<Array<Impressions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Impressions_Order_By>>;
  where?: InputMaybe<Impressions_Bool_Exp>;
};


/** columns and relationships of "books" */
export type BooksImpressions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Impressions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Impressions_Order_By>>;
  where?: InputMaybe<Impressions_Bool_Exp>;
};


/** columns and relationships of "books" */
export type BooksLending_HistoriesArgs = {
  distinct_on?: InputMaybe<Array<LendingHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<LendingHistories_Order_By>>;
  where?: InputMaybe<LendingHistories_Bool_Exp>;
};


/** columns and relationships of "books" */
export type BooksLending_Histories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<LendingHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<LendingHistories_Order_By>>;
  where?: InputMaybe<LendingHistories_Bool_Exp>;
};


/** columns and relationships of "books" */
export type BooksRegistration_HistoriesArgs = {
  distinct_on?: InputMaybe<Array<RegistrationHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<RegistrationHistories_Order_By>>;
  where?: InputMaybe<RegistrationHistories_Bool_Exp>;
};


/** columns and relationships of "books" */
export type BooksRegistration_Histories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<RegistrationHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<RegistrationHistories_Order_By>>;
  where?: InputMaybe<RegistrationHistories_Bool_Exp>;
};


/** columns and relationships of "books" */
export type BooksReservationsArgs = {
  distinct_on?: InputMaybe<Array<Reservations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Reservations_Order_By>>;
  where?: InputMaybe<Reservations_Bool_Exp>;
};


/** columns and relationships of "books" */
export type BooksReservations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reservations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Reservations_Order_By>>;
  where?: InputMaybe<Reservations_Bool_Exp>;
};

/** aggregated selection of "books" */
export type Books_Aggregate = {
  __typename?: 'books_aggregate';
  aggregate?: Maybe<Books_Aggregate_Fields>;
  nodes: Array<Books>;
};

/** aggregate fields of "books" */
export type Books_Aggregate_Fields = {
  __typename?: 'books_aggregate_fields';
  avg?: Maybe<Books_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Books_Max_Fields>;
  min?: Maybe<Books_Min_Fields>;
  stddev?: Maybe<Books_Stddev_Fields>;
  stddev_pop?: Maybe<Books_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Books_Stddev_Samp_Fields>;
  sum?: Maybe<Books_Sum_Fields>;
  var_pop?: Maybe<Books_Var_Pop_Fields>;
  var_samp?: Maybe<Books_Var_Samp_Fields>;
  variance?: Maybe<Books_Variance_Fields>;
};


/** aggregate fields of "books" */
export type Books_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Books_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** aggregate avg on columns */
export type Books_Avg_Fields = {
  __typename?: 'books_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "books". All fields are combined with a logical 'AND'. */
export type Books_Bool_Exp = {
  _and?: InputMaybe<Array<Books_Bool_Exp>>;
  _not?: InputMaybe<Books_Bool_Exp>;
  _or?: InputMaybe<Array<Books_Bool_Exp>>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  imageUrl?: InputMaybe<String_Comparison_Exp>;
  impressions?: InputMaybe<Impressions_Bool_Exp>;
  isbn?: InputMaybe<String_Comparison_Exp>;
  lending_histories?: InputMaybe<LendingHistories_Bool_Exp>;
  registration_histories?: InputMaybe<RegistrationHistories_Bool_Exp>;
  reservations?: InputMaybe<Reservations_Bool_Exp>;
  title?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "books" */
export enum Books_Constraint {
  /** unique or primary key constraint */
  BooksIsbnKey = 'books_isbn_key',
  /** unique or primary key constraint */
  BooksPkey = 'books_pkey'
}

/** input type for incrementing numeric columns in table "books" */
export type Books_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "books" */
export type Books_Insert_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['Int']>;
  imageUrl?: InputMaybe<Scalars['String']>;
  impressions?: InputMaybe<Impressions_Arr_Rel_Insert_Input>;
  isbn?: InputMaybe<Scalars['String']>;
  lending_histories?: InputMaybe<LendingHistories_Arr_Rel_Insert_Input>;
  registration_histories?: InputMaybe<RegistrationHistories_Arr_Rel_Insert_Input>;
  reservations?: InputMaybe<Reservations_Arr_Rel_Insert_Input>;
  title?: InputMaybe<Scalars['String']>;
};

/** aggregate max on columns */
export type Books_Max_Fields = {
  __typename?: 'books_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  imageUrl?: Maybe<Scalars['String']>;
  isbn?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Books_Min_Fields = {
  __typename?: 'books_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  imageUrl?: Maybe<Scalars['String']>;
  isbn?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "books" */
export type Books_Mutation_Response = {
  __typename?: 'books_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Books>;
};

/** input type for inserting object relation for remote table "books" */
export type Books_Obj_Rel_Insert_Input = {
  data: Books_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Books_On_Conflict>;
};

/** on_conflict condition type for table "books" */
export type Books_On_Conflict = {
  constraint: Books_Constraint;
  update_columns?: Array<Books_Update_Column>;
  where?: InputMaybe<Books_Bool_Exp>;
};

/** Ordering options when selecting data from "books". */
export type Books_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  imageUrl?: InputMaybe<Order_By>;
  impressions_aggregate?: InputMaybe<Impressions_Aggregate_Order_By>;
  isbn?: InputMaybe<Order_By>;
  lending_histories_aggregate?: InputMaybe<LendingHistories_Aggregate_Order_By>;
  registration_histories_aggregate?: InputMaybe<RegistrationHistories_Aggregate_Order_By>;
  reservations_aggregate?: InputMaybe<Reservations_Aggregate_Order_By>;
  title?: InputMaybe<Order_By>;
};

/** primary key columns input for table: books */
export type Books_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** select columns of table "books" */
export enum Books_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  ImageUrl = 'imageUrl',
  /** column name */
  Isbn = 'isbn',
  /** column name */
  Title = 'title'
}

/** input type for updating data in table "books" */
export type Books_Set_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['Int']>;
  imageUrl?: InputMaybe<Scalars['String']>;
  isbn?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Books_Stddev_Fields = {
  __typename?: 'books_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Books_Stddev_Pop_Fields = {
  __typename?: 'books_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Books_Stddev_Samp_Fields = {
  __typename?: 'books_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Books_Sum_Fields = {
  __typename?: 'books_sum_fields';
  id?: Maybe<Scalars['Int']>;
};

/** update columns of table "books" */
export enum Books_Update_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  ImageUrl = 'imageUrl',
  /** column name */
  Isbn = 'isbn',
  /** column name */
  Title = 'title'
}

/** aggregate var_pop on columns */
export type Books_Var_Pop_Fields = {
  __typename?: 'books_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Books_Var_Samp_Fields = {
  __typename?: 'books_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Books_Variance_Fields = {
  __typename?: 'books_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to compare columns of type "date". All fields are combined with logical 'AND'. */
export type Date_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['date']>;
  _gt?: InputMaybe<Scalars['date']>;
  _gte?: InputMaybe<Scalars['date']>;
  _in?: InputMaybe<Array<Scalars['date']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['date']>;
  _lte?: InputMaybe<Scalars['date']>;
  _neq?: InputMaybe<Scalars['date']>;
  _nin?: InputMaybe<Array<Scalars['date']>>;
};

/** columns and relationships of "impressions" */
export type Impressions = {
  __typename?: 'impressions';
  /** An object relationship */
  book: Books;
  bookId: Scalars['Int'];
  createdAt: Scalars['timestamptz'];
  id: Scalars['Int'];
  impression: Scalars['String'];
  updatedAt: Scalars['timestamptz'];
  /** An object relationship */
  user: Users;
  userId: Scalars['Int'];
};

/** aggregated selection of "impressions" */
export type Impressions_Aggregate = {
  __typename?: 'impressions_aggregate';
  aggregate?: Maybe<Impressions_Aggregate_Fields>;
  nodes: Array<Impressions>;
};

/** aggregate fields of "impressions" */
export type Impressions_Aggregate_Fields = {
  __typename?: 'impressions_aggregate_fields';
  avg?: Maybe<Impressions_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Impressions_Max_Fields>;
  min?: Maybe<Impressions_Min_Fields>;
  stddev?: Maybe<Impressions_Stddev_Fields>;
  stddev_pop?: Maybe<Impressions_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Impressions_Stddev_Samp_Fields>;
  sum?: Maybe<Impressions_Sum_Fields>;
  var_pop?: Maybe<Impressions_Var_Pop_Fields>;
  var_samp?: Maybe<Impressions_Var_Samp_Fields>;
  variance?: Maybe<Impressions_Variance_Fields>;
};


/** aggregate fields of "impressions" */
export type Impressions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Impressions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "impressions" */
export type Impressions_Aggregate_Order_By = {
  avg?: InputMaybe<Impressions_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Impressions_Max_Order_By>;
  min?: InputMaybe<Impressions_Min_Order_By>;
  stddev?: InputMaybe<Impressions_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Impressions_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Impressions_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Impressions_Sum_Order_By>;
  var_pop?: InputMaybe<Impressions_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Impressions_Var_Samp_Order_By>;
  variance?: InputMaybe<Impressions_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "impressions" */
export type Impressions_Arr_Rel_Insert_Input = {
  data: Array<Impressions_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Impressions_On_Conflict>;
};

/** aggregate avg on columns */
export type Impressions_Avg_Fields = {
  __typename?: 'impressions_avg_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "impressions" */
export type Impressions_Avg_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "impressions". All fields are combined with a logical 'AND'. */
export type Impressions_Bool_Exp = {
  _and?: InputMaybe<Array<Impressions_Bool_Exp>>;
  _not?: InputMaybe<Impressions_Bool_Exp>;
  _or?: InputMaybe<Array<Impressions_Bool_Exp>>;
  book?: InputMaybe<Books_Bool_Exp>;
  bookId?: InputMaybe<Int_Comparison_Exp>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  impression?: InputMaybe<String_Comparison_Exp>;
  updatedAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  userId?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "impressions" */
export enum Impressions_Constraint {
  /** unique or primary key constraint */
  ImpressionsPkey = 'impressions_pkey'
}

/** input type for incrementing numeric columns in table "impressions" */
export type Impressions_Inc_Input = {
  bookId?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['Int']>;
  userId?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "impressions" */
export type Impressions_Insert_Input = {
  book?: InputMaybe<Books_Obj_Rel_Insert_Input>;
  bookId?: InputMaybe<Scalars['Int']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['Int']>;
  impression?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  userId?: InputMaybe<Scalars['Int']>;
};

/** aggregate max on columns */
export type Impressions_Max_Fields = {
  __typename?: 'impressions_max_fields';
  bookId?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  impression?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "impressions" */
export type Impressions_Max_Order_By = {
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  impression?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Impressions_Min_Fields = {
  __typename?: 'impressions_min_fields';
  bookId?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  impression?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['timestamptz']>;
  userId?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "impressions" */
export type Impressions_Min_Order_By = {
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  impression?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "impressions" */
export type Impressions_Mutation_Response = {
  __typename?: 'impressions_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Impressions>;
};

/** on_conflict condition type for table "impressions" */
export type Impressions_On_Conflict = {
  constraint: Impressions_Constraint;
  update_columns?: Array<Impressions_Update_Column>;
  where?: InputMaybe<Impressions_Bool_Exp>;
};

/** Ordering options when selecting data from "impressions". */
export type Impressions_Order_By = {
  book?: InputMaybe<Books_Order_By>;
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  impression?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** primary key columns input for table: impressions */
export type Impressions_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** select columns of table "impressions" */
export enum Impressions_Select_Column {
  /** column name */
  BookId = 'bookId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  Impression = 'impression',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId'
}

/** input type for updating data in table "impressions" */
export type Impressions_Set_Input = {
  bookId?: InputMaybe<Scalars['Int']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['Int']>;
  impression?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['timestamptz']>;
  userId?: InputMaybe<Scalars['Int']>;
};

/** aggregate stddev on columns */
export type Impressions_Stddev_Fields = {
  __typename?: 'impressions_stddev_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "impressions" */
export type Impressions_Stddev_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Impressions_Stddev_Pop_Fields = {
  __typename?: 'impressions_stddev_pop_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "impressions" */
export type Impressions_Stddev_Pop_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Impressions_Stddev_Samp_Fields = {
  __typename?: 'impressions_stddev_samp_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "impressions" */
export type Impressions_Stddev_Samp_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Impressions_Sum_Fields = {
  __typename?: 'impressions_sum_fields';
  bookId?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "impressions" */
export type Impressions_Sum_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** update columns of table "impressions" */
export enum Impressions_Update_Column {
  /** column name */
  BookId = 'bookId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  Impression = 'impression',
  /** column name */
  UpdatedAt = 'updatedAt',
  /** column name */
  UserId = 'userId'
}

/** aggregate var_pop on columns */
export type Impressions_Var_Pop_Fields = {
  __typename?: 'impressions_var_pop_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "impressions" */
export type Impressions_Var_Pop_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Impressions_Var_Samp_Fields = {
  __typename?: 'impressions_var_samp_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "impressions" */
export type Impressions_Var_Samp_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Impressions_Variance_Fields = {
  __typename?: 'impressions_variance_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "impressions" */
export type Impressions_Variance_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** columns and relationships of "lending_histories" */
export type LendingHistories = {
  __typename?: 'lendingHistories';
  /** An object relationship */
  book: Books;
  bookId: Scalars['Int'];
  createdAt: Scalars['timestamptz'];
  dueDate: Scalars['date'];
  id: Scalars['Int'];
  /** An array relationship */
  return_histories: Array<ReturnHistories>;
  /** An aggregate relationship */
  return_histories_aggregate: ReturnHistories_Aggregate;
  /** An object relationship */
  user: Users;
  userId: Scalars['Int'];
};


/** columns and relationships of "lending_histories" */
export type LendingHistoriesReturn_HistoriesArgs = {
  distinct_on?: InputMaybe<Array<ReturnHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<ReturnHistories_Order_By>>;
  where?: InputMaybe<ReturnHistories_Bool_Exp>;
};


/** columns and relationships of "lending_histories" */
export type LendingHistoriesReturn_Histories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<ReturnHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<ReturnHistories_Order_By>>;
  where?: InputMaybe<ReturnHistories_Bool_Exp>;
};

/** aggregated selection of "lending_histories" */
export type LendingHistories_Aggregate = {
  __typename?: 'lendingHistories_aggregate';
  aggregate?: Maybe<LendingHistories_Aggregate_Fields>;
  nodes: Array<LendingHistories>;
};

/** aggregate fields of "lending_histories" */
export type LendingHistories_Aggregate_Fields = {
  __typename?: 'lendingHistories_aggregate_fields';
  avg?: Maybe<LendingHistories_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<LendingHistories_Max_Fields>;
  min?: Maybe<LendingHistories_Min_Fields>;
  stddev?: Maybe<LendingHistories_Stddev_Fields>;
  stddev_pop?: Maybe<LendingHistories_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<LendingHistories_Stddev_Samp_Fields>;
  sum?: Maybe<LendingHistories_Sum_Fields>;
  var_pop?: Maybe<LendingHistories_Var_Pop_Fields>;
  var_samp?: Maybe<LendingHistories_Var_Samp_Fields>;
  variance?: Maybe<LendingHistories_Variance_Fields>;
};


/** aggregate fields of "lending_histories" */
export type LendingHistories_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<LendingHistories_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "lending_histories" */
export type LendingHistories_Aggregate_Order_By = {
  avg?: InputMaybe<LendingHistories_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<LendingHistories_Max_Order_By>;
  min?: InputMaybe<LendingHistories_Min_Order_By>;
  stddev?: InputMaybe<LendingHistories_Stddev_Order_By>;
  stddev_pop?: InputMaybe<LendingHistories_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<LendingHistories_Stddev_Samp_Order_By>;
  sum?: InputMaybe<LendingHistories_Sum_Order_By>;
  var_pop?: InputMaybe<LendingHistories_Var_Pop_Order_By>;
  var_samp?: InputMaybe<LendingHistories_Var_Samp_Order_By>;
  variance?: InputMaybe<LendingHistories_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "lending_histories" */
export type LendingHistories_Arr_Rel_Insert_Input = {
  data: Array<LendingHistories_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<LendingHistories_On_Conflict>;
};

/** aggregate avg on columns */
export type LendingHistories_Avg_Fields = {
  __typename?: 'lendingHistories_avg_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "lending_histories" */
export type LendingHistories_Avg_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "lending_histories". All fields are combined with a logical 'AND'. */
export type LendingHistories_Bool_Exp = {
  _and?: InputMaybe<Array<LendingHistories_Bool_Exp>>;
  _not?: InputMaybe<LendingHistories_Bool_Exp>;
  _or?: InputMaybe<Array<LendingHistories_Bool_Exp>>;
  book?: InputMaybe<Books_Bool_Exp>;
  bookId?: InputMaybe<Int_Comparison_Exp>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  dueDate?: InputMaybe<Date_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  return_histories?: InputMaybe<ReturnHistories_Bool_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  userId?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "lending_histories" */
export enum LendingHistories_Constraint {
  /** unique or primary key constraint */
  LendingHistoriesPkey = 'lending_histories_pkey'
}

/** input type for incrementing numeric columns in table "lending_histories" */
export type LendingHistories_Inc_Input = {
  bookId?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['Int']>;
  userId?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "lending_histories" */
export type LendingHistories_Insert_Input = {
  book?: InputMaybe<Books_Obj_Rel_Insert_Input>;
  bookId?: InputMaybe<Scalars['Int']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  dueDate?: InputMaybe<Scalars['date']>;
  id?: InputMaybe<Scalars['Int']>;
  return_histories?: InputMaybe<ReturnHistories_Arr_Rel_Insert_Input>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  userId?: InputMaybe<Scalars['Int']>;
};

/** aggregate max on columns */
export type LendingHistories_Max_Fields = {
  __typename?: 'lendingHistories_max_fields';
  bookId?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  dueDate?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "lending_histories" */
export type LendingHistories_Max_Order_By = {
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  dueDate?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type LendingHistories_Min_Fields = {
  __typename?: 'lendingHistories_min_fields';
  bookId?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  dueDate?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "lending_histories" */
export type LendingHistories_Min_Order_By = {
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  dueDate?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "lending_histories" */
export type LendingHistories_Mutation_Response = {
  __typename?: 'lendingHistories_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<LendingHistories>;
};

/** input type for inserting object relation for remote table "lending_histories" */
export type LendingHistories_Obj_Rel_Insert_Input = {
  data: LendingHistories_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<LendingHistories_On_Conflict>;
};

/** on_conflict condition type for table "lending_histories" */
export type LendingHistories_On_Conflict = {
  constraint: LendingHistories_Constraint;
  update_columns?: Array<LendingHistories_Update_Column>;
  where?: InputMaybe<LendingHistories_Bool_Exp>;
};

/** Ordering options when selecting data from "lending_histories". */
export type LendingHistories_Order_By = {
  book?: InputMaybe<Books_Order_By>;
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  dueDate?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  return_histories_aggregate?: InputMaybe<ReturnHistories_Aggregate_Order_By>;
  user?: InputMaybe<Users_Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** primary key columns input for table: lendingHistories */
export type LendingHistories_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** select columns of table "lending_histories" */
export enum LendingHistories_Select_Column {
  /** column name */
  BookId = 'bookId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DueDate = 'dueDate',
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'userId'
}

/** input type for updating data in table "lending_histories" */
export type LendingHistories_Set_Input = {
  bookId?: InputMaybe<Scalars['Int']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  dueDate?: InputMaybe<Scalars['date']>;
  id?: InputMaybe<Scalars['Int']>;
  userId?: InputMaybe<Scalars['Int']>;
};

/** aggregate stddev on columns */
export type LendingHistories_Stddev_Fields = {
  __typename?: 'lendingHistories_stddev_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "lending_histories" */
export type LendingHistories_Stddev_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type LendingHistories_Stddev_Pop_Fields = {
  __typename?: 'lendingHistories_stddev_pop_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "lending_histories" */
export type LendingHistories_Stddev_Pop_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type LendingHistories_Stddev_Samp_Fields = {
  __typename?: 'lendingHistories_stddev_samp_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "lending_histories" */
export type LendingHistories_Stddev_Samp_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type LendingHistories_Sum_Fields = {
  __typename?: 'lendingHistories_sum_fields';
  bookId?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "lending_histories" */
export type LendingHistories_Sum_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** update columns of table "lending_histories" */
export enum LendingHistories_Update_Column {
  /** column name */
  BookId = 'bookId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DueDate = 'dueDate',
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'userId'
}

/** aggregate var_pop on columns */
export type LendingHistories_Var_Pop_Fields = {
  __typename?: 'lendingHistories_var_pop_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "lending_histories" */
export type LendingHistories_Var_Pop_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type LendingHistories_Var_Samp_Fields = {
  __typename?: 'lendingHistories_var_samp_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "lending_histories" */
export type LendingHistories_Var_Samp_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type LendingHistories_Variance_Fields = {
  __typename?: 'lendingHistories_variance_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "lending_histories" */
export type LendingHistories_Variance_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "books" */
  delete_books?: Maybe<Books_Mutation_Response>;
  /** delete single row from the table: "books" */
  delete_books_by_pk?: Maybe<Books>;
  /** delete data from the table: "impressions" */
  delete_impressions?: Maybe<Impressions_Mutation_Response>;
  /** delete single row from the table: "impressions" */
  delete_impressions_by_pk?: Maybe<Impressions>;
  /** delete data from the table: "lending_histories" */
  delete_lendingHistories?: Maybe<LendingHistories_Mutation_Response>;
  /** delete single row from the table: "lending_histories" */
  delete_lendingHistories_by_pk?: Maybe<LendingHistories>;
  /** delete data from the table: "registration_histories" */
  delete_registrationHistories?: Maybe<RegistrationHistories_Mutation_Response>;
  /** delete single row from the table: "registration_histories" */
  delete_registrationHistories_by_pk?: Maybe<RegistrationHistories>;
  /** delete data from the table: "reservations" */
  delete_reservations?: Maybe<Reservations_Mutation_Response>;
  /** delete single row from the table: "reservations" */
  delete_reservations_by_pk?: Maybe<Reservations>;
  /** delete data from the table: "return_histories" */
  delete_returnHistories?: Maybe<ReturnHistories_Mutation_Response>;
  /** delete single row from the table: "return_histories" */
  delete_returnHistories_by_pk?: Maybe<ReturnHistories>;
  /** delete data from the table: "users" */
  delete_users?: Maybe<Users_Mutation_Response>;
  /** delete single row from the table: "users" */
  delete_users_by_pk?: Maybe<Users>;
  /** insert data into the table: "books" */
  insert_books?: Maybe<Books_Mutation_Response>;
  /** insert a single row into the table: "books" */
  insert_books_one?: Maybe<Books>;
  /** insert data into the table: "impressions" */
  insert_impressions?: Maybe<Impressions_Mutation_Response>;
  /** insert a single row into the table: "impressions" */
  insert_impressions_one?: Maybe<Impressions>;
  /** insert data into the table: "lending_histories" */
  insert_lendingHistories?: Maybe<LendingHistories_Mutation_Response>;
  /** insert a single row into the table: "lending_histories" */
  insert_lendingHistories_one?: Maybe<LendingHistories>;
  /** insert data into the table: "registration_histories" */
  insert_registrationHistories?: Maybe<RegistrationHistories_Mutation_Response>;
  /** insert a single row into the table: "registration_histories" */
  insert_registrationHistories_one?: Maybe<RegistrationHistories>;
  /** insert data into the table: "reservations" */
  insert_reservations?: Maybe<Reservations_Mutation_Response>;
  /** insert a single row into the table: "reservations" */
  insert_reservations_one?: Maybe<Reservations>;
  /** insert data into the table: "return_histories" */
  insert_returnHistories?: Maybe<ReturnHistories_Mutation_Response>;
  /** insert a single row into the table: "return_histories" */
  insert_returnHistories_one?: Maybe<ReturnHistories>;
  /** insert data into the table: "users" */
  insert_users?: Maybe<Users_Mutation_Response>;
  /** insert a single row into the table: "users" */
  insert_users_one?: Maybe<Users>;
  /** update data of the table: "books" */
  update_books?: Maybe<Books_Mutation_Response>;
  /** update single row of the table: "books" */
  update_books_by_pk?: Maybe<Books>;
  /** update data of the table: "impressions" */
  update_impressions?: Maybe<Impressions_Mutation_Response>;
  /** update single row of the table: "impressions" */
  update_impressions_by_pk?: Maybe<Impressions>;
  /** update data of the table: "lending_histories" */
  update_lendingHistories?: Maybe<LendingHistories_Mutation_Response>;
  /** update single row of the table: "lending_histories" */
  update_lendingHistories_by_pk?: Maybe<LendingHistories>;
  /** update data of the table: "registration_histories" */
  update_registrationHistories?: Maybe<RegistrationHistories_Mutation_Response>;
  /** update single row of the table: "registration_histories" */
  update_registrationHistories_by_pk?: Maybe<RegistrationHistories>;
  /** update data of the table: "reservations" */
  update_reservations?: Maybe<Reservations_Mutation_Response>;
  /** update single row of the table: "reservations" */
  update_reservations_by_pk?: Maybe<Reservations>;
  /** update data of the table: "return_histories" */
  update_returnHistories?: Maybe<ReturnHistories_Mutation_Response>;
  /** update single row of the table: "return_histories" */
  update_returnHistories_by_pk?: Maybe<ReturnHistories>;
  /** update data of the table: "users" */
  update_users?: Maybe<Users_Mutation_Response>;
  /** update single row of the table: "users" */
  update_users_by_pk?: Maybe<Users>;
};


/** mutation root */
export type Mutation_RootDelete_BooksArgs = {
  where: Books_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Books_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_ImpressionsArgs = {
  where: Impressions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Impressions_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_LendingHistoriesArgs = {
  where: LendingHistories_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_LendingHistories_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_RegistrationHistoriesArgs = {
  where: RegistrationHistories_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_RegistrationHistories_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_ReservationsArgs = {
  where: Reservations_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Reservations_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_ReturnHistoriesArgs = {
  where: ReturnHistories_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_ReturnHistories_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootDelete_UsersArgs = {
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Users_By_PkArgs = {
  id: Scalars['Int'];
};


/** mutation root */
export type Mutation_RootInsert_BooksArgs = {
  objects: Array<Books_Insert_Input>;
  on_conflict?: InputMaybe<Books_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Books_OneArgs = {
  object: Books_Insert_Input;
  on_conflict?: InputMaybe<Books_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ImpressionsArgs = {
  objects: Array<Impressions_Insert_Input>;
  on_conflict?: InputMaybe<Impressions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Impressions_OneArgs = {
  object: Impressions_Insert_Input;
  on_conflict?: InputMaybe<Impressions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_LendingHistoriesArgs = {
  objects: Array<LendingHistories_Insert_Input>;
  on_conflict?: InputMaybe<LendingHistories_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_LendingHistories_OneArgs = {
  object: LendingHistories_Insert_Input;
  on_conflict?: InputMaybe<LendingHistories_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_RegistrationHistoriesArgs = {
  objects: Array<RegistrationHistories_Insert_Input>;
  on_conflict?: InputMaybe<RegistrationHistories_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_RegistrationHistories_OneArgs = {
  object: RegistrationHistories_Insert_Input;
  on_conflict?: InputMaybe<RegistrationHistories_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ReservationsArgs = {
  objects: Array<Reservations_Insert_Input>;
  on_conflict?: InputMaybe<Reservations_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Reservations_OneArgs = {
  object: Reservations_Insert_Input;
  on_conflict?: InputMaybe<Reservations_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ReturnHistoriesArgs = {
  objects: Array<ReturnHistories_Insert_Input>;
  on_conflict?: InputMaybe<ReturnHistories_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ReturnHistories_OneArgs = {
  object: ReturnHistories_Insert_Input;
  on_conflict?: InputMaybe<ReturnHistories_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_UsersArgs = {
  objects: Array<Users_Insert_Input>;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Users_OneArgs = {
  object: Users_Insert_Input;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_BooksArgs = {
  _inc?: InputMaybe<Books_Inc_Input>;
  _set?: InputMaybe<Books_Set_Input>;
  where: Books_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Books_By_PkArgs = {
  _inc?: InputMaybe<Books_Inc_Input>;
  _set?: InputMaybe<Books_Set_Input>;
  pk_columns: Books_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_ImpressionsArgs = {
  _inc?: InputMaybe<Impressions_Inc_Input>;
  _set?: InputMaybe<Impressions_Set_Input>;
  where: Impressions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Impressions_By_PkArgs = {
  _inc?: InputMaybe<Impressions_Inc_Input>;
  _set?: InputMaybe<Impressions_Set_Input>;
  pk_columns: Impressions_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_LendingHistoriesArgs = {
  _inc?: InputMaybe<LendingHistories_Inc_Input>;
  _set?: InputMaybe<LendingHistories_Set_Input>;
  where: LendingHistories_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_LendingHistories_By_PkArgs = {
  _inc?: InputMaybe<LendingHistories_Inc_Input>;
  _set?: InputMaybe<LendingHistories_Set_Input>;
  pk_columns: LendingHistories_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_RegistrationHistoriesArgs = {
  _inc?: InputMaybe<RegistrationHistories_Inc_Input>;
  _set?: InputMaybe<RegistrationHistories_Set_Input>;
  where: RegistrationHistories_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_RegistrationHistories_By_PkArgs = {
  _inc?: InputMaybe<RegistrationHistories_Inc_Input>;
  _set?: InputMaybe<RegistrationHistories_Set_Input>;
  pk_columns: RegistrationHistories_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_ReservationsArgs = {
  _inc?: InputMaybe<Reservations_Inc_Input>;
  _set?: InputMaybe<Reservations_Set_Input>;
  where: Reservations_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Reservations_By_PkArgs = {
  _inc?: InputMaybe<Reservations_Inc_Input>;
  _set?: InputMaybe<Reservations_Set_Input>;
  pk_columns: Reservations_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_ReturnHistoriesArgs = {
  _inc?: InputMaybe<ReturnHistories_Inc_Input>;
  _set?: InputMaybe<ReturnHistories_Set_Input>;
  where: ReturnHistories_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_ReturnHistories_By_PkArgs = {
  _inc?: InputMaybe<ReturnHistories_Inc_Input>;
  _set?: InputMaybe<ReturnHistories_Set_Input>;
  pk_columns: ReturnHistories_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_UsersArgs = {
  _inc?: InputMaybe<Users_Inc_Input>;
  _set?: InputMaybe<Users_Set_Input>;
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Users_By_PkArgs = {
  _inc?: InputMaybe<Users_Inc_Input>;
  _set?: InputMaybe<Users_Set_Input>;
  pk_columns: Users_Pk_Columns_Input;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "books" */
  books: Array<Books>;
  /** fetch aggregated fields from the table: "books" */
  books_aggregate: Books_Aggregate;
  /** fetch data from the table: "books" using primary key columns */
  books_by_pk?: Maybe<Books>;
  /** An array relationship */
  impressions: Array<Impressions>;
  /** An aggregate relationship */
  impressions_aggregate: Impressions_Aggregate;
  /** fetch data from the table: "impressions" using primary key columns */
  impressions_by_pk?: Maybe<Impressions>;
  /** fetch data from the table: "lending_histories" */
  lendingHistories: Array<LendingHistories>;
  /** fetch aggregated fields from the table: "lending_histories" */
  lendingHistories_aggregate: LendingHistories_Aggregate;
  /** fetch data from the table: "lending_histories" using primary key columns */
  lendingHistories_by_pk?: Maybe<LendingHistories>;
  /** fetch data from the table: "registration_histories" */
  registrationHistories: Array<RegistrationHistories>;
  /** fetch aggregated fields from the table: "registration_histories" */
  registrationHistories_aggregate: RegistrationHistories_Aggregate;
  /** fetch data from the table: "registration_histories" using primary key columns */
  registrationHistories_by_pk?: Maybe<RegistrationHistories>;
  /** An array relationship */
  reservations: Array<Reservations>;
  /** An aggregate relationship */
  reservations_aggregate: Reservations_Aggregate;
  /** fetch data from the table: "reservations" using primary key columns */
  reservations_by_pk?: Maybe<Reservations>;
  /** fetch data from the table: "return_histories" */
  returnHistories: Array<ReturnHistories>;
  /** fetch aggregated fields from the table: "return_histories" */
  returnHistories_aggregate: ReturnHistories_Aggregate;
  /** fetch data from the table: "return_histories" using primary key columns */
  returnHistories_by_pk?: Maybe<ReturnHistories>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
};


export type Query_RootBooksArgs = {
  distinct_on?: InputMaybe<Array<Books_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Books_Order_By>>;
  where?: InputMaybe<Books_Bool_Exp>;
};


export type Query_RootBooks_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Books_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Books_Order_By>>;
  where?: InputMaybe<Books_Bool_Exp>;
};


export type Query_RootBooks_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootImpressionsArgs = {
  distinct_on?: InputMaybe<Array<Impressions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Impressions_Order_By>>;
  where?: InputMaybe<Impressions_Bool_Exp>;
};


export type Query_RootImpressions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Impressions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Impressions_Order_By>>;
  where?: InputMaybe<Impressions_Bool_Exp>;
};


export type Query_RootImpressions_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootLendingHistoriesArgs = {
  distinct_on?: InputMaybe<Array<LendingHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<LendingHistories_Order_By>>;
  where?: InputMaybe<LendingHistories_Bool_Exp>;
};


export type Query_RootLendingHistories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<LendingHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<LendingHistories_Order_By>>;
  where?: InputMaybe<LendingHistories_Bool_Exp>;
};


export type Query_RootLendingHistories_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootRegistrationHistoriesArgs = {
  distinct_on?: InputMaybe<Array<RegistrationHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<RegistrationHistories_Order_By>>;
  where?: InputMaybe<RegistrationHistories_Bool_Exp>;
};


export type Query_RootRegistrationHistories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<RegistrationHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<RegistrationHistories_Order_By>>;
  where?: InputMaybe<RegistrationHistories_Bool_Exp>;
};


export type Query_RootRegistrationHistories_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootReservationsArgs = {
  distinct_on?: InputMaybe<Array<Reservations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Reservations_Order_By>>;
  where?: InputMaybe<Reservations_Bool_Exp>;
};


export type Query_RootReservations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reservations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Reservations_Order_By>>;
  where?: InputMaybe<Reservations_Bool_Exp>;
};


export type Query_RootReservations_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootReturnHistoriesArgs = {
  distinct_on?: InputMaybe<Array<ReturnHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<ReturnHistories_Order_By>>;
  where?: InputMaybe<ReturnHistories_Bool_Exp>;
};


export type Query_RootReturnHistories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<ReturnHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<ReturnHistories_Order_By>>;
  where?: InputMaybe<ReturnHistories_Bool_Exp>;
};


export type Query_RootReturnHistories_By_PkArgs = {
  id: Scalars['Int'];
};


export type Query_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_By_PkArgs = {
  id: Scalars['Int'];
};

/** columns and relationships of "registration_histories" */
export type RegistrationHistories = {
  __typename?: 'registrationHistories';
  /** An object relationship */
  book: Books;
  bookId: Scalars['Int'];
  createdAt: Scalars['timestamptz'];
  id: Scalars['Int'];
  /** An object relationship */
  user: Users;
  userId: Scalars['Int'];
};

/** aggregated selection of "registration_histories" */
export type RegistrationHistories_Aggregate = {
  __typename?: 'registrationHistories_aggregate';
  aggregate?: Maybe<RegistrationHistories_Aggregate_Fields>;
  nodes: Array<RegistrationHistories>;
};

/** aggregate fields of "registration_histories" */
export type RegistrationHistories_Aggregate_Fields = {
  __typename?: 'registrationHistories_aggregate_fields';
  avg?: Maybe<RegistrationHistories_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<RegistrationHistories_Max_Fields>;
  min?: Maybe<RegistrationHistories_Min_Fields>;
  stddev?: Maybe<RegistrationHistories_Stddev_Fields>;
  stddev_pop?: Maybe<RegistrationHistories_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<RegistrationHistories_Stddev_Samp_Fields>;
  sum?: Maybe<RegistrationHistories_Sum_Fields>;
  var_pop?: Maybe<RegistrationHistories_Var_Pop_Fields>;
  var_samp?: Maybe<RegistrationHistories_Var_Samp_Fields>;
  variance?: Maybe<RegistrationHistories_Variance_Fields>;
};


/** aggregate fields of "registration_histories" */
export type RegistrationHistories_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<RegistrationHistories_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "registration_histories" */
export type RegistrationHistories_Aggregate_Order_By = {
  avg?: InputMaybe<RegistrationHistories_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<RegistrationHistories_Max_Order_By>;
  min?: InputMaybe<RegistrationHistories_Min_Order_By>;
  stddev?: InputMaybe<RegistrationHistories_Stddev_Order_By>;
  stddev_pop?: InputMaybe<RegistrationHistories_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<RegistrationHistories_Stddev_Samp_Order_By>;
  sum?: InputMaybe<RegistrationHistories_Sum_Order_By>;
  var_pop?: InputMaybe<RegistrationHistories_Var_Pop_Order_By>;
  var_samp?: InputMaybe<RegistrationHistories_Var_Samp_Order_By>;
  variance?: InputMaybe<RegistrationHistories_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "registration_histories" */
export type RegistrationHistories_Arr_Rel_Insert_Input = {
  data: Array<RegistrationHistories_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<RegistrationHistories_On_Conflict>;
};

/** aggregate avg on columns */
export type RegistrationHistories_Avg_Fields = {
  __typename?: 'registrationHistories_avg_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "registration_histories" */
export type RegistrationHistories_Avg_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "registration_histories". All fields are combined with a logical 'AND'. */
export type RegistrationHistories_Bool_Exp = {
  _and?: InputMaybe<Array<RegistrationHistories_Bool_Exp>>;
  _not?: InputMaybe<RegistrationHistories_Bool_Exp>;
  _or?: InputMaybe<Array<RegistrationHistories_Bool_Exp>>;
  book?: InputMaybe<Books_Bool_Exp>;
  bookId?: InputMaybe<Int_Comparison_Exp>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  userId?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "registration_histories" */
export enum RegistrationHistories_Constraint {
  /** unique or primary key constraint */
  RegistrationHistoriesPkey = 'registration_histories_pkey'
}

/** input type for incrementing numeric columns in table "registration_histories" */
export type RegistrationHistories_Inc_Input = {
  bookId?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['Int']>;
  userId?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "registration_histories" */
export type RegistrationHistories_Insert_Input = {
  book?: InputMaybe<Books_Obj_Rel_Insert_Input>;
  bookId?: InputMaybe<Scalars['Int']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['Int']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  userId?: InputMaybe<Scalars['Int']>;
};

/** aggregate max on columns */
export type RegistrationHistories_Max_Fields = {
  __typename?: 'registrationHistories_max_fields';
  bookId?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "registration_histories" */
export type RegistrationHistories_Max_Order_By = {
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type RegistrationHistories_Min_Fields = {
  __typename?: 'registrationHistories_min_fields';
  bookId?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "registration_histories" */
export type RegistrationHistories_Min_Order_By = {
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "registration_histories" */
export type RegistrationHistories_Mutation_Response = {
  __typename?: 'registrationHistories_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<RegistrationHistories>;
};

/** on_conflict condition type for table "registration_histories" */
export type RegistrationHistories_On_Conflict = {
  constraint: RegistrationHistories_Constraint;
  update_columns?: Array<RegistrationHistories_Update_Column>;
  where?: InputMaybe<RegistrationHistories_Bool_Exp>;
};

/** Ordering options when selecting data from "registration_histories". */
export type RegistrationHistories_Order_By = {
  book?: InputMaybe<Books_Order_By>;
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** primary key columns input for table: registrationHistories */
export type RegistrationHistories_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** select columns of table "registration_histories" */
export enum RegistrationHistories_Select_Column {
  /** column name */
  BookId = 'bookId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'userId'
}

/** input type for updating data in table "registration_histories" */
export type RegistrationHistories_Set_Input = {
  bookId?: InputMaybe<Scalars['Int']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['Int']>;
  userId?: InputMaybe<Scalars['Int']>;
};

/** aggregate stddev on columns */
export type RegistrationHistories_Stddev_Fields = {
  __typename?: 'registrationHistories_stddev_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "registration_histories" */
export type RegistrationHistories_Stddev_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type RegistrationHistories_Stddev_Pop_Fields = {
  __typename?: 'registrationHistories_stddev_pop_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "registration_histories" */
export type RegistrationHistories_Stddev_Pop_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type RegistrationHistories_Stddev_Samp_Fields = {
  __typename?: 'registrationHistories_stddev_samp_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "registration_histories" */
export type RegistrationHistories_Stddev_Samp_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type RegistrationHistories_Sum_Fields = {
  __typename?: 'registrationHistories_sum_fields';
  bookId?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "registration_histories" */
export type RegistrationHistories_Sum_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** update columns of table "registration_histories" */
export enum RegistrationHistories_Update_Column {
  /** column name */
  BookId = 'bookId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  UserId = 'userId'
}

/** aggregate var_pop on columns */
export type RegistrationHistories_Var_Pop_Fields = {
  __typename?: 'registrationHistories_var_pop_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "registration_histories" */
export type RegistrationHistories_Var_Pop_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type RegistrationHistories_Var_Samp_Fields = {
  __typename?: 'registrationHistories_var_samp_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "registration_histories" */
export type RegistrationHistories_Var_Samp_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type RegistrationHistories_Variance_Fields = {
  __typename?: 'registrationHistories_variance_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "registration_histories" */
export type RegistrationHistories_Variance_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** columns and relationships of "reservations" */
export type Reservations = {
  __typename?: 'reservations';
  /** An object relationship */
  book: Books;
  bookId: Scalars['Int'];
  createdAt: Scalars['timestamptz'];
  id: Scalars['Int'];
  reservationDate: Scalars['date'];
  /** An object relationship */
  user: Users;
  userId: Scalars['Int'];
};

/** aggregated selection of "reservations" */
export type Reservations_Aggregate = {
  __typename?: 'reservations_aggregate';
  aggregate?: Maybe<Reservations_Aggregate_Fields>;
  nodes: Array<Reservations>;
};

/** aggregate fields of "reservations" */
export type Reservations_Aggregate_Fields = {
  __typename?: 'reservations_aggregate_fields';
  avg?: Maybe<Reservations_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Reservations_Max_Fields>;
  min?: Maybe<Reservations_Min_Fields>;
  stddev?: Maybe<Reservations_Stddev_Fields>;
  stddev_pop?: Maybe<Reservations_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Reservations_Stddev_Samp_Fields>;
  sum?: Maybe<Reservations_Sum_Fields>;
  var_pop?: Maybe<Reservations_Var_Pop_Fields>;
  var_samp?: Maybe<Reservations_Var_Samp_Fields>;
  variance?: Maybe<Reservations_Variance_Fields>;
};


/** aggregate fields of "reservations" */
export type Reservations_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Reservations_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "reservations" */
export type Reservations_Aggregate_Order_By = {
  avg?: InputMaybe<Reservations_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Reservations_Max_Order_By>;
  min?: InputMaybe<Reservations_Min_Order_By>;
  stddev?: InputMaybe<Reservations_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Reservations_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Reservations_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Reservations_Sum_Order_By>;
  var_pop?: InputMaybe<Reservations_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Reservations_Var_Samp_Order_By>;
  variance?: InputMaybe<Reservations_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "reservations" */
export type Reservations_Arr_Rel_Insert_Input = {
  data: Array<Reservations_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Reservations_On_Conflict>;
};

/** aggregate avg on columns */
export type Reservations_Avg_Fields = {
  __typename?: 'reservations_avg_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "reservations" */
export type Reservations_Avg_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "reservations". All fields are combined with a logical 'AND'. */
export type Reservations_Bool_Exp = {
  _and?: InputMaybe<Array<Reservations_Bool_Exp>>;
  _not?: InputMaybe<Reservations_Bool_Exp>;
  _or?: InputMaybe<Array<Reservations_Bool_Exp>>;
  book?: InputMaybe<Books_Bool_Exp>;
  bookId?: InputMaybe<Int_Comparison_Exp>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  reservationDate?: InputMaybe<Date_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  userId?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "reservations" */
export enum Reservations_Constraint {
  /** unique or primary key constraint */
  ReservationsPkey = 'reservations_pkey'
}

/** input type for incrementing numeric columns in table "reservations" */
export type Reservations_Inc_Input = {
  bookId?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['Int']>;
  userId?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "reservations" */
export type Reservations_Insert_Input = {
  book?: InputMaybe<Books_Obj_Rel_Insert_Input>;
  bookId?: InputMaybe<Scalars['Int']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['Int']>;
  reservationDate?: InputMaybe<Scalars['date']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  userId?: InputMaybe<Scalars['Int']>;
};

/** aggregate max on columns */
export type Reservations_Max_Fields = {
  __typename?: 'reservations_max_fields';
  bookId?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  reservationDate?: Maybe<Scalars['date']>;
  userId?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "reservations" */
export type Reservations_Max_Order_By = {
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  reservationDate?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Reservations_Min_Fields = {
  __typename?: 'reservations_min_fields';
  bookId?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  reservationDate?: Maybe<Scalars['date']>;
  userId?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "reservations" */
export type Reservations_Min_Order_By = {
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  reservationDate?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "reservations" */
export type Reservations_Mutation_Response = {
  __typename?: 'reservations_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Reservations>;
};

/** on_conflict condition type for table "reservations" */
export type Reservations_On_Conflict = {
  constraint: Reservations_Constraint;
  update_columns?: Array<Reservations_Update_Column>;
  where?: InputMaybe<Reservations_Bool_Exp>;
};

/** Ordering options when selecting data from "reservations". */
export type Reservations_Order_By = {
  book?: InputMaybe<Books_Order_By>;
  bookId?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  reservationDate?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** primary key columns input for table: reservations */
export type Reservations_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** select columns of table "reservations" */
export enum Reservations_Select_Column {
  /** column name */
  BookId = 'bookId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  ReservationDate = 'reservationDate',
  /** column name */
  UserId = 'userId'
}

/** input type for updating data in table "reservations" */
export type Reservations_Set_Input = {
  bookId?: InputMaybe<Scalars['Int']>;
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['Int']>;
  reservationDate?: InputMaybe<Scalars['date']>;
  userId?: InputMaybe<Scalars['Int']>;
};

/** aggregate stddev on columns */
export type Reservations_Stddev_Fields = {
  __typename?: 'reservations_stddev_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "reservations" */
export type Reservations_Stddev_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Reservations_Stddev_Pop_Fields = {
  __typename?: 'reservations_stddev_pop_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "reservations" */
export type Reservations_Stddev_Pop_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Reservations_Stddev_Samp_Fields = {
  __typename?: 'reservations_stddev_samp_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "reservations" */
export type Reservations_Stddev_Samp_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Reservations_Sum_Fields = {
  __typename?: 'reservations_sum_fields';
  bookId?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['Int']>;
  userId?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "reservations" */
export type Reservations_Sum_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** update columns of table "reservations" */
export enum Reservations_Update_Column {
  /** column name */
  BookId = 'bookId',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  ReservationDate = 'reservationDate',
  /** column name */
  UserId = 'userId'
}

/** aggregate var_pop on columns */
export type Reservations_Var_Pop_Fields = {
  __typename?: 'reservations_var_pop_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "reservations" */
export type Reservations_Var_Pop_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Reservations_Var_Samp_Fields = {
  __typename?: 'reservations_var_samp_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "reservations" */
export type Reservations_Var_Samp_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Reservations_Variance_Fields = {
  __typename?: 'reservations_variance_fields';
  bookId?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['Float']>;
  userId?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "reservations" */
export type Reservations_Variance_Order_By = {
  bookId?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** columns and relationships of "return_histories" */
export type ReturnHistories = {
  __typename?: 'returnHistories';
  createdAt: Scalars['timestamptz'];
  id: Scalars['Int'];
  lendingHistoryId: Scalars['Int'];
  /** An object relationship */
  lending_history: LendingHistories;
};

/** aggregated selection of "return_histories" */
export type ReturnHistories_Aggregate = {
  __typename?: 'returnHistories_aggregate';
  aggregate?: Maybe<ReturnHistories_Aggregate_Fields>;
  nodes: Array<ReturnHistories>;
};

/** aggregate fields of "return_histories" */
export type ReturnHistories_Aggregate_Fields = {
  __typename?: 'returnHistories_aggregate_fields';
  avg?: Maybe<ReturnHistories_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<ReturnHistories_Max_Fields>;
  min?: Maybe<ReturnHistories_Min_Fields>;
  stddev?: Maybe<ReturnHistories_Stddev_Fields>;
  stddev_pop?: Maybe<ReturnHistories_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<ReturnHistories_Stddev_Samp_Fields>;
  sum?: Maybe<ReturnHistories_Sum_Fields>;
  var_pop?: Maybe<ReturnHistories_Var_Pop_Fields>;
  var_samp?: Maybe<ReturnHistories_Var_Samp_Fields>;
  variance?: Maybe<ReturnHistories_Variance_Fields>;
};


/** aggregate fields of "return_histories" */
export type ReturnHistories_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<ReturnHistories_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "return_histories" */
export type ReturnHistories_Aggregate_Order_By = {
  avg?: InputMaybe<ReturnHistories_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<ReturnHistories_Max_Order_By>;
  min?: InputMaybe<ReturnHistories_Min_Order_By>;
  stddev?: InputMaybe<ReturnHistories_Stddev_Order_By>;
  stddev_pop?: InputMaybe<ReturnHistories_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<ReturnHistories_Stddev_Samp_Order_By>;
  sum?: InputMaybe<ReturnHistories_Sum_Order_By>;
  var_pop?: InputMaybe<ReturnHistories_Var_Pop_Order_By>;
  var_samp?: InputMaybe<ReturnHistories_Var_Samp_Order_By>;
  variance?: InputMaybe<ReturnHistories_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "return_histories" */
export type ReturnHistories_Arr_Rel_Insert_Input = {
  data: Array<ReturnHistories_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<ReturnHistories_On_Conflict>;
};

/** aggregate avg on columns */
export type ReturnHistories_Avg_Fields = {
  __typename?: 'returnHistories_avg_fields';
  id?: Maybe<Scalars['Float']>;
  lendingHistoryId?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "return_histories" */
export type ReturnHistories_Avg_Order_By = {
  id?: InputMaybe<Order_By>;
  lendingHistoryId?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "return_histories". All fields are combined with a logical 'AND'. */
export type ReturnHistories_Bool_Exp = {
  _and?: InputMaybe<Array<ReturnHistories_Bool_Exp>>;
  _not?: InputMaybe<ReturnHistories_Bool_Exp>;
  _or?: InputMaybe<Array<ReturnHistories_Bool_Exp>>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  lendingHistoryId?: InputMaybe<Int_Comparison_Exp>;
  lending_history?: InputMaybe<LendingHistories_Bool_Exp>;
};

/** unique or primary key constraints on table "return_histories" */
export enum ReturnHistories_Constraint {
  /** unique or primary key constraint */
  ReturnHistoriesPkey = 'return_histories_pkey'
}

/** input type for incrementing numeric columns in table "return_histories" */
export type ReturnHistories_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
  lendingHistoryId?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "return_histories" */
export type ReturnHistories_Insert_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['Int']>;
  lendingHistoryId?: InputMaybe<Scalars['Int']>;
  lending_history?: InputMaybe<LendingHistories_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type ReturnHistories_Max_Fields = {
  __typename?: 'returnHistories_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  lendingHistoryId?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "return_histories" */
export type ReturnHistories_Max_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lendingHistoryId?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type ReturnHistories_Min_Fields = {
  __typename?: 'returnHistories_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['Int']>;
  lendingHistoryId?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "return_histories" */
export type ReturnHistories_Min_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lendingHistoryId?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "return_histories" */
export type ReturnHistories_Mutation_Response = {
  __typename?: 'returnHistories_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<ReturnHistories>;
};

/** on_conflict condition type for table "return_histories" */
export type ReturnHistories_On_Conflict = {
  constraint: ReturnHistories_Constraint;
  update_columns?: Array<ReturnHistories_Update_Column>;
  where?: InputMaybe<ReturnHistories_Bool_Exp>;
};

/** Ordering options when selecting data from "return_histories". */
export type ReturnHistories_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  lendingHistoryId?: InputMaybe<Order_By>;
  lending_history?: InputMaybe<LendingHistories_Order_By>;
};

/** primary key columns input for table: returnHistories */
export type ReturnHistories_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** select columns of table "return_histories" */
export enum ReturnHistories_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  LendingHistoryId = 'lendingHistoryId'
}

/** input type for updating data in table "return_histories" */
export type ReturnHistories_Set_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['Int']>;
  lendingHistoryId?: InputMaybe<Scalars['Int']>;
};

/** aggregate stddev on columns */
export type ReturnHistories_Stddev_Fields = {
  __typename?: 'returnHistories_stddev_fields';
  id?: Maybe<Scalars['Float']>;
  lendingHistoryId?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "return_histories" */
export type ReturnHistories_Stddev_Order_By = {
  id?: InputMaybe<Order_By>;
  lendingHistoryId?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type ReturnHistories_Stddev_Pop_Fields = {
  __typename?: 'returnHistories_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
  lendingHistoryId?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "return_histories" */
export type ReturnHistories_Stddev_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  lendingHistoryId?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type ReturnHistories_Stddev_Samp_Fields = {
  __typename?: 'returnHistories_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
  lendingHistoryId?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "return_histories" */
export type ReturnHistories_Stddev_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  lendingHistoryId?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type ReturnHistories_Sum_Fields = {
  __typename?: 'returnHistories_sum_fields';
  id?: Maybe<Scalars['Int']>;
  lendingHistoryId?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "return_histories" */
export type ReturnHistories_Sum_Order_By = {
  id?: InputMaybe<Order_By>;
  lendingHistoryId?: InputMaybe<Order_By>;
};

/** update columns of table "return_histories" */
export enum ReturnHistories_Update_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Id = 'id',
  /** column name */
  LendingHistoryId = 'lendingHistoryId'
}

/** aggregate var_pop on columns */
export type ReturnHistories_Var_Pop_Fields = {
  __typename?: 'returnHistories_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
  lendingHistoryId?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "return_histories" */
export type ReturnHistories_Var_Pop_Order_By = {
  id?: InputMaybe<Order_By>;
  lendingHistoryId?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type ReturnHistories_Var_Samp_Fields = {
  __typename?: 'returnHistories_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
  lendingHistoryId?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "return_histories" */
export type ReturnHistories_Var_Samp_Order_By = {
  id?: InputMaybe<Order_By>;
  lendingHistoryId?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type ReturnHistories_Variance_Fields = {
  __typename?: 'returnHistories_variance_fields';
  id?: Maybe<Scalars['Float']>;
  lendingHistoryId?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "return_histories" */
export type ReturnHistories_Variance_Order_By = {
  id?: InputMaybe<Order_By>;
  lendingHistoryId?: InputMaybe<Order_By>;
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "books" */
  books: Array<Books>;
  /** fetch aggregated fields from the table: "books" */
  books_aggregate: Books_Aggregate;
  /** fetch data from the table: "books" using primary key columns */
  books_by_pk?: Maybe<Books>;
  /** An array relationship */
  impressions: Array<Impressions>;
  /** An aggregate relationship */
  impressions_aggregate: Impressions_Aggregate;
  /** fetch data from the table: "impressions" using primary key columns */
  impressions_by_pk?: Maybe<Impressions>;
  /** fetch data from the table: "lending_histories" */
  lendingHistories: Array<LendingHistories>;
  /** fetch aggregated fields from the table: "lending_histories" */
  lendingHistories_aggregate: LendingHistories_Aggregate;
  /** fetch data from the table: "lending_histories" using primary key columns */
  lendingHistories_by_pk?: Maybe<LendingHistories>;
  /** fetch data from the table: "registration_histories" */
  registrationHistories: Array<RegistrationHistories>;
  /** fetch aggregated fields from the table: "registration_histories" */
  registrationHistories_aggregate: RegistrationHistories_Aggregate;
  /** fetch data from the table: "registration_histories" using primary key columns */
  registrationHistories_by_pk?: Maybe<RegistrationHistories>;
  /** An array relationship */
  reservations: Array<Reservations>;
  /** An aggregate relationship */
  reservations_aggregate: Reservations_Aggregate;
  /** fetch data from the table: "reservations" using primary key columns */
  reservations_by_pk?: Maybe<Reservations>;
  /** fetch data from the table: "return_histories" */
  returnHistories: Array<ReturnHistories>;
  /** fetch aggregated fields from the table: "return_histories" */
  returnHistories_aggregate: ReturnHistories_Aggregate;
  /** fetch data from the table: "return_histories" using primary key columns */
  returnHistories_by_pk?: Maybe<ReturnHistories>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
};


export type Subscription_RootBooksArgs = {
  distinct_on?: InputMaybe<Array<Books_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Books_Order_By>>;
  where?: InputMaybe<Books_Bool_Exp>;
};


export type Subscription_RootBooks_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Books_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Books_Order_By>>;
  where?: InputMaybe<Books_Bool_Exp>;
};


export type Subscription_RootBooks_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootImpressionsArgs = {
  distinct_on?: InputMaybe<Array<Impressions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Impressions_Order_By>>;
  where?: InputMaybe<Impressions_Bool_Exp>;
};


export type Subscription_RootImpressions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Impressions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Impressions_Order_By>>;
  where?: InputMaybe<Impressions_Bool_Exp>;
};


export type Subscription_RootImpressions_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootLendingHistoriesArgs = {
  distinct_on?: InputMaybe<Array<LendingHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<LendingHistories_Order_By>>;
  where?: InputMaybe<LendingHistories_Bool_Exp>;
};


export type Subscription_RootLendingHistories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<LendingHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<LendingHistories_Order_By>>;
  where?: InputMaybe<LendingHistories_Bool_Exp>;
};


export type Subscription_RootLendingHistories_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootRegistrationHistoriesArgs = {
  distinct_on?: InputMaybe<Array<RegistrationHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<RegistrationHistories_Order_By>>;
  where?: InputMaybe<RegistrationHistories_Bool_Exp>;
};


export type Subscription_RootRegistrationHistories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<RegistrationHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<RegistrationHistories_Order_By>>;
  where?: InputMaybe<RegistrationHistories_Bool_Exp>;
};


export type Subscription_RootRegistrationHistories_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootReservationsArgs = {
  distinct_on?: InputMaybe<Array<Reservations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Reservations_Order_By>>;
  where?: InputMaybe<Reservations_Bool_Exp>;
};


export type Subscription_RootReservations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reservations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Reservations_Order_By>>;
  where?: InputMaybe<Reservations_Bool_Exp>;
};


export type Subscription_RootReservations_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootReturnHistoriesArgs = {
  distinct_on?: InputMaybe<Array<ReturnHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<ReturnHistories_Order_By>>;
  where?: InputMaybe<ReturnHistories_Bool_Exp>;
};


export type Subscription_RootReturnHistories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<ReturnHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<ReturnHistories_Order_By>>;
  where?: InputMaybe<ReturnHistories_Bool_Exp>;
};


export type Subscription_RootReturnHistories_By_PkArgs = {
  id: Scalars['Int'];
};


export type Subscription_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_By_PkArgs = {
  id: Scalars['Int'];
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']>;
  _gt?: InputMaybe<Scalars['timestamptz']>;
  _gte?: InputMaybe<Scalars['timestamptz']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['timestamptz']>;
  _lte?: InputMaybe<Scalars['timestamptz']>;
  _neq?: InputMaybe<Scalars['timestamptz']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']>>;
};

/** columns and relationships of "users" */
export type Users = {
  __typename?: 'users';
  createdAt: Scalars['timestamptz'];
  email: Scalars['String'];
  id: Scalars['Int'];
  imageUrl: Scalars['String'];
  /** An array relationship */
  impressions: Array<Impressions>;
  /** An aggregate relationship */
  impressions_aggregate: Impressions_Aggregate;
  /** An array relationship */
  lending_histories: Array<LendingHistories>;
  /** An aggregate relationship */
  lending_histories_aggregate: LendingHistories_Aggregate;
  name: Scalars['String'];
  /** An array relationship */
  registration_histories: Array<RegistrationHistories>;
  /** An aggregate relationship */
  registration_histories_aggregate: RegistrationHistories_Aggregate;
  /** An array relationship */
  reservations: Array<Reservations>;
  /** An aggregate relationship */
  reservations_aggregate: Reservations_Aggregate;
};


/** columns and relationships of "users" */
export type UsersImpressionsArgs = {
  distinct_on?: InputMaybe<Array<Impressions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Impressions_Order_By>>;
  where?: InputMaybe<Impressions_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersImpressions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Impressions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Impressions_Order_By>>;
  where?: InputMaybe<Impressions_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersLending_HistoriesArgs = {
  distinct_on?: InputMaybe<Array<LendingHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<LendingHistories_Order_By>>;
  where?: InputMaybe<LendingHistories_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersLending_Histories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<LendingHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<LendingHistories_Order_By>>;
  where?: InputMaybe<LendingHistories_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersRegistration_HistoriesArgs = {
  distinct_on?: InputMaybe<Array<RegistrationHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<RegistrationHistories_Order_By>>;
  where?: InputMaybe<RegistrationHistories_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersRegistration_Histories_AggregateArgs = {
  distinct_on?: InputMaybe<Array<RegistrationHistories_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<RegistrationHistories_Order_By>>;
  where?: InputMaybe<RegistrationHistories_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersReservationsArgs = {
  distinct_on?: InputMaybe<Array<Reservations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Reservations_Order_By>>;
  where?: InputMaybe<Reservations_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersReservations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Reservations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Reservations_Order_By>>;
  where?: InputMaybe<Reservations_Bool_Exp>;
};

/** aggregated selection of "users" */
export type Users_Aggregate = {
  __typename?: 'users_aggregate';
  aggregate?: Maybe<Users_Aggregate_Fields>;
  nodes: Array<Users>;
};

/** aggregate fields of "users" */
export type Users_Aggregate_Fields = {
  __typename?: 'users_aggregate_fields';
  avg?: Maybe<Users_Avg_Fields>;
  count: Scalars['Int'];
  max?: Maybe<Users_Max_Fields>;
  min?: Maybe<Users_Min_Fields>;
  stddev?: Maybe<Users_Stddev_Fields>;
  stddev_pop?: Maybe<Users_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Users_Stddev_Samp_Fields>;
  sum?: Maybe<Users_Sum_Fields>;
  var_pop?: Maybe<Users_Var_Pop_Fields>;
  var_samp?: Maybe<Users_Var_Samp_Fields>;
  variance?: Maybe<Users_Variance_Fields>;
};


/** aggregate fields of "users" */
export type Users_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** aggregate avg on columns */
export type Users_Avg_Fields = {
  __typename?: 'users_avg_fields';
  id?: Maybe<Scalars['Float']>;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  _and?: InputMaybe<Array<Users_Bool_Exp>>;
  _not?: InputMaybe<Users_Bool_Exp>;
  _or?: InputMaybe<Array<Users_Bool_Exp>>;
  createdAt?: InputMaybe<Timestamptz_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  imageUrl?: InputMaybe<String_Comparison_Exp>;
  impressions?: InputMaybe<Impressions_Bool_Exp>;
  lending_histories?: InputMaybe<LendingHistories_Bool_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  registration_histories?: InputMaybe<RegistrationHistories_Bool_Exp>;
  reservations?: InputMaybe<Reservations_Bool_Exp>;
};

/** unique or primary key constraints on table "users" */
export enum Users_Constraint {
  /** unique or primary key constraint */
  UsersEmailKey = 'users_email_key',
  /** unique or primary key constraint */
  UsersPkey = 'users_pkey'
}

/** input type for incrementing numeric columns in table "users" */
export type Users_Inc_Input = {
  id?: InputMaybe<Scalars['Int']>;
};

/** input type for inserting data into table "users" */
export type Users_Insert_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  email?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  imageUrl?: InputMaybe<Scalars['String']>;
  impressions?: InputMaybe<Impressions_Arr_Rel_Insert_Input>;
  lending_histories?: InputMaybe<LendingHistories_Arr_Rel_Insert_Input>;
  name?: InputMaybe<Scalars['String']>;
  registration_histories?: InputMaybe<RegistrationHistories_Arr_Rel_Insert_Input>;
  reservations?: InputMaybe<Reservations_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  __typename?: 'users_max_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  imageUrl?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  __typename?: 'users_min_fields';
  createdAt?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  imageUrl?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

/** response of any mutation on the table "users" */
export type Users_Mutation_Response = {
  __typename?: 'users_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Users>;
};

/** input type for inserting object relation for remote table "users" */
export type Users_Obj_Rel_Insert_Input = {
  data: Users_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Users_On_Conflict>;
};

/** on_conflict condition type for table "users" */
export type Users_On_Conflict = {
  constraint: Users_Constraint;
  update_columns?: Array<Users_Update_Column>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** Ordering options when selecting data from "users". */
export type Users_Order_By = {
  createdAt?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  imageUrl?: InputMaybe<Order_By>;
  impressions_aggregate?: InputMaybe<Impressions_Aggregate_Order_By>;
  lending_histories_aggregate?: InputMaybe<LendingHistories_Aggregate_Order_By>;
  name?: InputMaybe<Order_By>;
  registration_histories_aggregate?: InputMaybe<RegistrationHistories_Aggregate_Order_By>;
  reservations_aggregate?: InputMaybe<Reservations_Aggregate_Order_By>;
};

/** primary key columns input for table: users */
export type Users_Pk_Columns_Input = {
  id: Scalars['Int'];
};

/** select columns of table "users" */
export enum Users_Select_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  ImageUrl = 'imageUrl',
  /** column name */
  Name = 'name'
}

/** input type for updating data in table "users" */
export type Users_Set_Input = {
  createdAt?: InputMaybe<Scalars['timestamptz']>;
  email?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  imageUrl?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

/** aggregate stddev on columns */
export type Users_Stddev_Fields = {
  __typename?: 'users_stddev_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_pop on columns */
export type Users_Stddev_Pop_Fields = {
  __typename?: 'users_stddev_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate stddev_samp on columns */
export type Users_Stddev_Samp_Fields = {
  __typename?: 'users_stddev_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate sum on columns */
export type Users_Sum_Fields = {
  __typename?: 'users_sum_fields';
  id?: Maybe<Scalars['Int']>;
};

/** update columns of table "users" */
export enum Users_Update_Column {
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  ImageUrl = 'imageUrl',
  /** column name */
  Name = 'name'
}

/** aggregate var_pop on columns */
export type Users_Var_Pop_Fields = {
  __typename?: 'users_var_pop_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate var_samp on columns */
export type Users_Var_Samp_Fields = {
  __typename?: 'users_var_samp_fields';
  id?: Maybe<Scalars['Float']>;
};

/** aggregate variance on columns */
export type Users_Variance_Fields = {
  __typename?: 'users_variance_fields';
  id?: Maybe<Scalars['Float']>;
};

/**
 * A Directive provides a way to describe alternate runtime execution and type validation behavior in a GraphQL document.
 *
 * In some cases, you need to provide options to alter GraphQL's execution behavior in ways field arguments will not suffice, such as conditionally including or skipping a field. Directives provide this by describing additional information to the executor.
 */
export type __Directive = {
  __typename?: '__Directive';
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  isRepeatable: Scalars['Boolean'];
  locations: Array<__DirectiveLocation>;
  args: Array<__InputValue>;
};


/**
 * A Directive provides a way to describe alternate runtime execution and type validation behavior in a GraphQL document.
 *
 * In some cases, you need to provide options to alter GraphQL's execution behavior in ways field arguments will not suffice, such as conditionally including or skipping a field. Directives provide this by describing additional information to the executor.
 */
export type __DirectiveArgsArgs = {
  includeDeprecated?: InputMaybe<Scalars['Boolean']>;
};

/** A Directive can be adjacent to many parts of the GraphQL language, a __DirectiveLocation describes one such possible adjacencies. */
export enum __DirectiveLocation {
  /** Location adjacent to a query operation. */
  Query = 'QUERY',
  /** Location adjacent to a mutation operation. */
  Mutation = 'MUTATION',
  /** Location adjacent to a subscription operation. */
  Subscription = 'SUBSCRIPTION',
  /** Location adjacent to a field. */
  Field = 'FIELD',
  /** Location adjacent to a fragment definition. */
  FragmentDefinition = 'FRAGMENT_DEFINITION',
  /** Location adjacent to a fragment spread. */
  FragmentSpread = 'FRAGMENT_SPREAD',
  /** Location adjacent to an inline fragment. */
  InlineFragment = 'INLINE_FRAGMENT',
  /** Location adjacent to a variable definition. */
  VariableDefinition = 'VARIABLE_DEFINITION',
  /** Location adjacent to a schema definition. */
  Schema = 'SCHEMA',
  /** Location adjacent to a scalar definition. */
  Scalar = 'SCALAR',
  /** Location adjacent to an object type definition. */
  Object = 'OBJECT',
  /** Location adjacent to a field definition. */
  FieldDefinition = 'FIELD_DEFINITION',
  /** Location adjacent to an argument definition. */
  ArgumentDefinition = 'ARGUMENT_DEFINITION',
  /** Location adjacent to an interface definition. */
  Interface = 'INTERFACE',
  /** Location adjacent to a union definition. */
  Union = 'UNION',
  /** Location adjacent to an enum definition. */
  Enum = 'ENUM',
  /** Location adjacent to an enum value definition. */
  EnumValue = 'ENUM_VALUE',
  /** Location adjacent to an input object type definition. */
  InputObject = 'INPUT_OBJECT',
  /** Location adjacent to an input object field definition. */
  InputFieldDefinition = 'INPUT_FIELD_DEFINITION'
}

/** One possible value for a given Enum. Enum values are unique values, not a placeholder for a string or numeric value. However an Enum value is returned in a JSON response as a string. */
export type __EnumValue = {
  __typename?: '__EnumValue';
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  isDeprecated: Scalars['Boolean'];
  deprecationReason?: Maybe<Scalars['String']>;
};

/** Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type. */
export type __Field = {
  __typename?: '__Field';
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  args: Array<__InputValue>;
  type: __Type;
  isDeprecated: Scalars['Boolean'];
  deprecationReason?: Maybe<Scalars['String']>;
};


/** Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type. */
export type __FieldArgsArgs = {
  includeDeprecated?: InputMaybe<Scalars['Boolean']>;
};

/** Arguments provided to Fields or Directives and the input fields of an InputObject are represented as Input Values which describe their type and optionally a default value. */
export type __InputValue = {
  __typename?: '__InputValue';
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  type: __Type;
  /** A GraphQL-formatted string representing the default value for this input value. */
  defaultValue?: Maybe<Scalars['String']>;
  isDeprecated: Scalars['Boolean'];
  deprecationReason?: Maybe<Scalars['String']>;
};

/** A GraphQL Schema defines the capabilities of a GraphQL server. It exposes all available types and directives on the server, as well as the entry points for query, mutation, and subscription operations. */
export type __Schema = {
  __typename?: '__Schema';
  description?: Maybe<Scalars['String']>;
  /** A list of all types supported by this server. */
  types: Array<__Type>;
  /** The type that query operations will be rooted at. */
  queryType: __Type;
  /** If this server supports mutation, the type that mutation operations will be rooted at. */
  mutationType?: Maybe<__Type>;
  /** If this server support subscription, the type that subscription operations will be rooted at. */
  subscriptionType?: Maybe<__Type>;
  /** A list of all directives supported by this server. */
  directives: Array<__Directive>;
};

/**
 * The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.
 *
 * Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByURL`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
 */
export type __Type = {
  __typename?: '__Type';
  kind: __TypeKind;
  name?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  specifiedByURL?: Maybe<Scalars['String']>;
  fields?: Maybe<Array<__Field>>;
  interfaces?: Maybe<Array<__Type>>;
  possibleTypes?: Maybe<Array<__Type>>;
  enumValues?: Maybe<Array<__EnumValue>>;
  inputFields?: Maybe<Array<__InputValue>>;
  ofType?: Maybe<__Type>;
};


/**
 * The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.
 *
 * Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByURL`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
 */
export type __TypeFieldsArgs = {
  includeDeprecated?: InputMaybe<Scalars['Boolean']>;
};


/**
 * The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.
 *
 * Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByURL`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
 */
export type __TypeEnumValuesArgs = {
  includeDeprecated?: InputMaybe<Scalars['Boolean']>;
};


/**
 * The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.
 *
 * Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByURL`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
 */
export type __TypeInputFieldsArgs = {
  includeDeprecated?: InputMaybe<Scalars['Boolean']>;
};

/** An enum describing what kind of type a given `__Type` is. */
export enum __TypeKind {
  /** Indicates this type is a scalar. */
  Scalar = 'SCALAR',
  /** Indicates this type is an object. `fields` and `interfaces` are valid fields. */
  Object = 'OBJECT',
  /** Indicates this type is an interface. `fields`, `interfaces`, and `possibleTypes` are valid fields. */
  Interface = 'INTERFACE',
  /** Indicates this type is a union. `possibleTypes` is a valid field. */
  Union = 'UNION',
  /** Indicates this type is an enum. `enumValues` is a valid field. */
  Enum = 'ENUM',
  /** Indicates this type is an input object. `inputFields` is a valid field. */
  InputObject = 'INPUT_OBJECT',
  /** Indicates this type is a list. `ofType` is a valid field. */
  List = 'LIST',
  /** Indicates this type is a non-null. `ofType` is a valid field. */
  NonNull = 'NON_NULL'
}

export type MyFirstQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type MyFirstQueryQuery = { __typename?: 'query_root', __schema: { __typename?: '__Schema', types: Array<{ __typename?: '__Type', name?: string | null }> } };
