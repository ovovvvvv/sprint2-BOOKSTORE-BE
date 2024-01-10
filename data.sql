INSERT INTO books (title, form, isbn, summary, detail, author, pages, contents, price, pub_date)
VALUES ("어린왕자들", "종이책", 0, "어리다", "많이 어리다", "김어림", 100, "목차입니다.", 20000, "2019-01-01")

INSERT INTO books (title, form, isbn, summary, detail, author, pages, contents, price, pub_date)
VALUES ("신데렐라들", "종이책", 1, "유리구두", "투명한 유리구두", "김구두", 100, "목차입니다.", 20000, "2023-12-01")

INSERT INTO books (title, form, isbn, summary, detail, author, pages, contents, price, pub_date)
VALUES ("백설공주들", "종이책", 2, "사과", "빨간 사과", "김사과", 100, "목차입니다.", 20000, "2023-11-01")

INSERT INTO books (title, form, isbn, summary, detail, author, pages, contents, price, pub_date)
VALUES ("어린왕자들", "종이책", 3, "제비", "까만 제비", "김제비", 100, "목차입니다.", 20000, "2023-12-08")

INSERT INTO books (title, img, category_id, form, isbn, summary, detail, author, pages, contents,price, pub_date)
VALUES ("콩쥐 팥쥐", 4, 0, "ebook", 4, "콩팥..", "콩심은데 콩나고..", "김콩팥", 100, "목차입니다.", 20000, "2023-12-07");

/* 조인 */
SELECT * FROM books LEFT
JOIN category ON books.category_id = category.id;

SELECT * FROM books LEFT JOIN category ON books.category_id = category.id WHERE books.id = 1;

/* 좋아요 추가 */
INSERT INTO likes (user_id, liked_book_id) VALUES (1, 1);
INSERT INTO likes (user_id, liked_book_id) VALUES (1, 2);
INSERT INTO likes (user_id, liked_book_id) VALUES (1, 3);
INSERT INTO likes (user_id, liked_book_id) VALUES (3, 1);
INSERT INTO likes (user_id, liked_book_id) VALUES (3, 4);
INSERT INTO likes (user_id, liked_book_id) VALUES (6, 1);
INSERT INTO likes (user_id, liked_book_id) VALUES (6, 2);
INSERT INTO likes (user_id, liked_book_id) VALUES (6, 3);
INSERT INTO likes (user_id, liked_book_id) VALUES (6, 5);

/* 좋아요 삭제 */
DELETE FROM likes WHERE user_id = 1 AND liked_book_id = 3

/* 테이블의 조건을 만족하는 행 개수 */
SELECT count(*) FROM likes WHERE liked_book_id = 1;

/* 좋아요 개수 세서 books 테이블에 컬럼 추가해서 출력해주기 */
도서 테이블 전체 조회 + 컬럼 1개 추가하기
SELECT *,
    값 AS 새로 추가할 컬럼명
    FROM books;

SELECT *,
    (각 행마다 likes 테이블에 liked_book_id로 가지고 있는 행 수) AS likes
    FROM books;

/* 좋아요 개수가 포함된 books 테이블 조회 */
SELECT *,
    (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes
    FROM books;


/* 개별 도서 조회 시, 사용자가 좋아요를 했는지 여부를 포함 */

/* 
서브(sub)쿼리: 쿼리 안의 쿼리
count(): 행 개수
AS: 컬럼 별칭
 */

 /* 장바구니 담기 */
INSERT INTO cartItems (book_id, quantity, user_id)
VALUES (1, 1, 1);

/* 장바구니 조회 */
SELECT cartItems.id, book_id, title, summary, quantity, price 
FROM cartItems LEFT JOIN books ON cartItems.book_id = books.id;

/* 장바구니에서 선택한(장바구니 아이템id) 아이템 목록 조회 */
SELECT * FROM cartItems
WHERE user_id = 1
AND id IN (1,3);

/* 주문하기 */
/* 배송 정보 입력 */
INSERT INTO delivery (address, receiver, contact) VALUES ("서울시 노원구", "유진", "010-1234-5678")
const delivery_id = SELECT max(id) FROM delivery;

/* 주문 정보 입력 */
INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
VALUES ("어린왕자들", 3, 60000, 1, delivery_id);
const order_id = SELEcT max(id) FROM orders;

/* 주문 상세 목록 입력 */
INSERT INTO orderedBook (order_id, book_id, quantity)
VALUES (order_id, 1, 1);

INSERT INTO orderedBook (order_id, book_id, quantity)
VALUES (order_id, 5, 2);

/* max함수 사용법 */
SELECT max(id) FROM Bookshop.orderedBook;
/* last_insert_id() 사용법
동일 시간대에 아이디가 삽입된다면 오류가 날 수도 있음 
 */
SELECT last_insert_id(); 
