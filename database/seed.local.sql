-- LOCAL DEVELOPMENT SEED ONLY.
-- Safe to re-run: fixed IDs and unique business keys are upserted.
-- Do not use this file against production or shared environments.
SET NAMES utf8mb4;
START TRANSACTION;

-- Auth test accounts all use LocalTest123! (bcrypt, cost 12).
-- These are intentionally local-only accounts; never reuse their hash or password.
INSERT INTO users (id,email,phone,password_hash,full_name,email_verified,status,role) VALUES
 (900001,'seed-admin@local.test','+84910000001','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Quản trị hệ thống',1,'ACTIVE','admin'),
 (900002,'seed-seller-a@local.test','+84910000002','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Nguyễn Minh Anh',1,'ACTIVE','seller'),
 (900003,'seed-buyer@local.test','+84910000003','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Trần Ngọc Hà',1,'ACTIVE','client'),
 (900004,'seed-seller-b@local.test','+84910000004','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Lê Hoàng Nam',1,'ACTIVE','client'),
 (900005,'seed-locked@local.test','+84910000005','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Tài khoản kiểm thử khóa',1,'LOCKED','client'),
 (900006,'seed-unverified@local.test','+84910000006','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Tài khoản chưa xác minh',0,'ACTIVE','client'),
 (900007,'seed-seller-tech@local.test','+84910000007','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Phạm Minh Đức',1,'ACTIVE','seller')
ON DUPLICATE KEY UPDATE email=VALUES(email),phone=VALUES(phone),password_hash=VALUES(password_hash),full_name=VALUES(full_name),email_verified=VALUES(email_verified),status=VALUES(status),role=VALUES(role);

INSERT INTO addresses (id,user_id,recipient_name,phone,province,district,ward,street_detail,is_default) VALUES
 (910001,900003,'Trần Ngọc Hà','+84910000003','Hà Nội','Cầu Giấy','Dịch Vọng','12 Phố Duy Tân',1),
 (910002,900002,'Nguyễn Minh Anh','+84910000002','Hồ Chí Minh','Quận 1','Bến Nghé','25 Nguyễn Huệ',1)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id),recipient_name=VALUES(recipient_name),phone=VALUES(phone),province=VALUES(province),district=VALUES(district),ward=VALUES(ward),street_detail=VALUES(street_detail),is_default=VALUES(is_default);

INSERT INTO shops (id,owner_id,name,description,logo_url,banner_url,phone,warehouse_address,status,follower_count,approved_at) VALUES
 (920001,900002,'An Nhiên Living','Thời trang cơ bản và đồ dùng tiện ích, ưu tiên chất liệu bền và thiết kế tối giản.','https://images.unsplash.com/photo-1544816155-12df9643f363?w=300','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200','+84910000012','Cầu Giấy, Hà Nội','ACTIVE',1,UTC_TIMESTAMP()),
 (920002,900004,'Bếp Nhà Mộc','Đồ gia dụng và cà phê chọn lọc từ các nhà cung cấp trong nước.','https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200','+84910000014','Quận 1, TP Hồ Chí Minh','PENDING',0,NULL),
 (920003,900007,'Tech An Việt','Thiết bị công nghệ chính hãng, phụ kiện tương thích và máy tính cho học tập, làm việc.','https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300','https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200','+84910000017','Quận 3, TP Hồ Chí Minh','ACTIVE',0,UTC_TIMESTAMP())
ON DUPLICATE KEY UPDATE owner_id=VALUES(owner_id),name=VALUES(name),description=VALUES(description),logo_url=VALUES(logo_url),banner_url=VALUES(banner_url),phone=VALUES(phone),warehouse_address=VALUES(warehouse_address),status=VALUES(status),follower_count=VALUES(follower_count),approved_at=VALUES(approved_at);

DELETE FROM user_roles WHERE user_id=900004 AND role_code='SELLER';
INSERT IGNORE INTO user_roles (user_id,role_code)
SELECT id,'CLIENT' FROM users WHERE id BETWEEN 900001 AND 900007;
INSERT IGNORE INTO user_roles (user_id,role_code)
SELECT id,'ADMIN' FROM users WHERE id=900001;
INSERT IGNORE INTO user_roles (user_id,role_code)
SELECT owner_id,'SELLER' FROM shops WHERE owner_id IN (900002,900004,900007) AND status='ACTIVE';

INSERT INTO shop_followers (shop_id,user_id) VALUES (920001,900003)
ON DUPLICATE KEY UPDATE shop_id=VALUES(shop_id);

INSERT INTO categories (id,parent_id,name,slug,image_url,sort_order,is_active) VALUES
 (930001,NULL,'Thời trang','thoi-trang','https://images.unsplash.com/photo-1445205170230-053b83016050?w=300',1,1),
 (930002,930001,'Áo và quần','ao-quan','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',2,1),
 (930003,NULL,'Nhà cửa và đời sống','nha-cua-doi-song','https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300',3,1),
 (930004,NULL,'Thực phẩm và đồ uống','thuc-pham-do-uong','https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300',4,1),
 (930005,NULL,'Điện thoại và điện tử','dien-thoai-dien-tu','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',5,1),
 (930006,930001,'Áo khoác','ao-khoac','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300',6,1),
 (930007,930005,'Máy tính và laptop','may-tinh-laptop','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',7,1),
 (930008,930003,'Đồ bếp và bàn ăn','do-bep-ban-an','https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=300',8,1),
 (930009,930004,'Cà phê và trà','ca-phe-tra','https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300',9,1),
 (930010,930001,'Balo và túi xách','balo-tui-xach','https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',10,1),
 (930011,930001,'Giày dép','giay-dep','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',11,1),
 (930012,930005,'Phụ kiện máy tính','phu-kien-may-tinh','https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',12,1)
ON DUPLICATE KEY UPDATE parent_id=VALUES(parent_id),name=VALUES(name),slug=VALUES(slug),image_url=VALUES(image_url),sort_order=VALUES(sort_order),is_active=VALUES(is_active);

INSERT INTO brands (id,name,slug,is_active) VALUES
 (940001,'An Nhiên','an-nhien',1),
 (940002,'Bếp Việt','bep-viet',1),
 (940003,'Apple','apple',1),
 (940004,'Samsung','samsung',1),
 (940005,'Xiaomi','xiaomi',1),
 (940006,'Anker','anker',1),
 (940007,'Lenovo','lenovo',1),
 (940008,'Dell','dell',1),
 (940009,'Logitech','logitech',1),
 (940010,'Khe Sanh Coffee','khe-sanh-coffee',1)
ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),is_active=VALUES(is_active);

INSERT INTO attributes (id,name) VALUES
 (950001,'Màu sắc'),(950002,'Kích cỡ'),(950003,'CPU'),(950004,'RAM'),(950005,'Dung lượng lưu trữ')
ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO attribute_values (id,attribute_id,value) VALUES
 (951001,950001,'Đen'),(951002,950001,'Trắng'),(951003,950002,'M'),(951004,950002,'L'),
 (951005,950003,'Intel Core i5'),(951006,950003,'Intel Core i7'),
 (951007,950004,'16GB'),(951008,950004,'32GB'),
 (951009,950005,'512GB SSD'),(951010,950005,'1TB SSD')
ON DUPLICATE KEY UPDATE attribute_id=VALUES(attribute_id),value=VALUES(value);

INSERT INTO category_attributes (category_id,attribute_id,is_required,sort_order) VALUES
 (930006,950001,1,1),(930006,950002,1,2),
 (930007,950003,1,1),(930007,950004,1,2),(930007,950005,0,3)
ON DUPLICATE KEY UPDATE is_required=VALUES(is_required),sort_order=VALUES(sort_order);

INSERT INTO products (id,shop_id,category_id,brand_id,name,slug,description,thumbnail_url,price,sold_count,rating_avg,rating_count,status,is_deleted) VALUES
 (960001,920001,930002,940001,'Áo thun cotton Everyday','ao-thun-cotton-everyday','Áo thun cotton mềm, phom suông dễ mặc; phù hợp sử dụng hằng ngày.','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',250000,1,5.00,1,'ACTIVE',0),
 (960002,920001,930010,940001,'Túi tote canvas Natural','tui-tote-canvas-natural','Túi canvas dày, quai chịu lực, có ngăn trong để sắp xếp vật dụng cá nhân.','https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',180000,0,0,0,'ACTIVE',0),
 (960003,920002,930009,940010,'Cà phê Arabica rang vừa 250g','ca-phe-arabica-rang-vua-250g','Hạt Arabica rang vừa, đóng gói van một chiều để giữ hương thơm.','https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',145000,0,0,0,'PENDING',0),
 (960004,920003,930005,940003,'Apple iPhone 15 Pro Max 256GB','apple-iphone-15-pro-max-256gb','iPhone 15 Pro Max phiên bản 256GB, màn hình Super Retina XDR và camera Pro.','https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',29990000,1,0,0,'ACTIVE',0),
 (960005,920003,930005,940003,'Apple iPhone 15 Pro 128GB','apple-iphone-15-pro-128gb','iPhone 15 Pro 128GB với camera chuyên nghiệp và thiết kế titan.','https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',25990000,0,0,0,'ACTIVE',0),
 (960006,920003,930005,940003,'Apple iPhone 15 128GB','apple-iphone-15-128gb','iPhone 15 128GB, màn hình OLED và cổng USB-C.','https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',19990000,0,0,0,'ACTIVE',0),
 (960007,920003,930005,NULL,'Ốp lưng MagSafe trong suốt cho iPhone 15 Pro Max','op-lung-magsafe-iphone-15-pro-max','Ốp lưng trong suốt hỗ trợ MagSafe, bảo vệ cạnh và cụm camera.','https://images.unsplash.com/photo-1603313011105-34b1b4e5e9f1?w=800',390000,0,0,0,'ACTIVE',0),
 (960008,920003,930005,NULL,'Cáp USB-C sạc nhanh 20W dài 1m','cap-usb-c-sac-nhanh-20w-1m','Cáp USB-C dài 1m hỗ trợ sạc nhanh và truyền dữ liệu.','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',190000,0,0,0,'ACTIVE',0),
 (960009,920003,930005,NULL,'Bộ sạc USB-C 30W','bo-sac-usb-c-30w','Bộ sạc USB-C công suất 30W, nhỏ gọn cho điện thoại và máy tính bảng. Fixture này được Postman dùng để kiểm thử API kho hàng.','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',100000,0,0,0,'ACTIVE',0),
 (960010,920001,930006,940001,'Áo khoác gió chống nước Wind','ao-khoac-gio-chong-nuoc-wind','Áo khoác gió nhẹ, lớp ngoài hạn chế thấm nước và có mũ trùm điều chỉnh được.','https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',650000,0,0,0,'ACTIVE',0),
 (960011,920003,930007,940007,'Laptop Lenovo IdeaPad 5 14 inch','laptop-lenovo-ideapad-5-14','Laptop Lenovo IdeaPad 5 màn hình 14 inch, phù hợp học tập và làm việc văn phòng.','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',22990000,0,0,0,'ACTIVE',0),
 (960012,920001,930002,940001,'Áo sơ mi linen tay dài','ao-so-mi-linen-tay-dai','Áo sơ mi linen thoáng mát, đường may gọn và dễ phối cùng trang phục công sở.','https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800',490000,0,0,0,'ACTIVE',0),
 (960013,920001,930002,940001,'Quần jeans straight fit','quan-jeans-straight-fit','Quần jeans dáng straight fit, chất denim co giãn nhẹ và đường may chắc chắn.','https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',690000,0,0,0,'ACTIVE',0),
 (960014,920001,930002,940001,'Áo hoodie cotton nỉ bông','ao-hoodie-cotton-ni-bong','Hoodie cotton mặt trong nỉ mềm, có túi kangaroo và bo tay giữ phom.','https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',590000,0,0,0,'ACTIVE',0),
 (960015,920001,930002,940001,'Áo polo cotton pique','ao-polo-cotton-pique','Áo polo cotton pique thoáng khí, cổ áo đứng phom và dễ giặt chăm sóc.','https://images.unsplash.com/photo-1625910513413-5fc45e8e4a0f?w=800',320000,0,0,0,'ACTIVE',0),
 (960016,920001,930006,940001,'Áo khoác denim Classic','ao-khoac-denim-classic','Áo khoác denim dày vừa, túi ngực có nắp và hàng nút kim loại.','https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800',890000,0,0,0,'ACTIVE',0),
 (960017,920001,930010,940001,'Balo laptop canvas 15 inch','balo-laptop-canvas-15-inch','Balo canvas có ngăn chống sốc cho laptop 15 inch, ngăn phụ và đệm lưng thoáng khí.','https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',790000,0,0,0,'ACTIVE',0),
 (960018,920001,930011,940001,'Giày sneaker Urban Lite','giay-sneaker-urban-lite','Giày sneaker đế cao su nhẹ, lót êm và thân lưới thoáng khí cho đi lại hằng ngày.','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',1200000,0,0,0,'ACTIVE',0),
 (960019,920001,930003,940002,'Đèn bàn LED điều chỉnh ánh sáng','den-ban-led-dieu-chinh-anh-sang','Đèn bàn LED ba mức sáng, cổ đèn điều chỉnh linh hoạt và cổng sạc USB.','https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',450000,0,0,0,'ACTIVE',0),
 (960020,920001,930003,940002,'Khay gỗ sồi để bàn đa năng','khay-go-soi-de-ban-da-nang','Khay gỗ sồi hoàn thiện dầu thực vật, dùng sắp xếp phụ kiện trên bàn làm việc.','https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800',220000,0,0,0,'ACTIVE',0),
 (960021,920001,930008,940002,'Cốc gốm men trắng 350ml','coc-gom-men-trang-350ml','Cốc gốm nung nhiệt cao, dung tích 350ml, dùng được với máy rửa chén.','https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',180000,0,0,0,'ACTIVE',0),
 (960022,920001,930008,940002,'Nồi inox đáy từ 20cm','noi-inox-day-tu-20cm','Nồi inox 3 lớp đáy từ đường kính 20cm, nắp kính và quai cầm cách nhiệt.','https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',1100000,0,0,0,'ACTIVE',0),
 (960023,920002,930009,940010,'Cà phê phin rang xay 500g','ca-phe-phin-rang-xay-500g','Cà phê rang xay phù hợp pha phin, đóng gói 500g. Sản phẩm đang chờ duyệt cửa hàng.','https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',210000,0,0,0,'PENDING',0),
 (960024,920001,930009,940010,'Hạt Arabica Cầu Đất 250g','hat-arabica-cau-dat-250g','Hạt Arabica Cầu Đất sơ chế ướt, rang vừa, phù hợp pha pour-over và máy espresso.','https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',220000,0,0,0,'ACTIVE',0),
 (960025,920003,930005,940003,'Apple iPhone 15 Plus 128GB','apple-iphone-15-plus-128gb','iPhone 15 Plus 128GB với màn hình lớn, pin dùng cả ngày và cổng USB-C.','https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',22990000,0,0,0,'ACTIVE',0),
 (960026,920003,930005,940004,'Samsung Galaxy A55 5G 128GB','samsung-galaxy-a55-5g-128gb','Samsung Galaxy A55 5G 128GB, màn hình Super AMOLED và camera chống rung quang học.','https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',9990000,0,0,0,'ACTIVE',0),
 (960027,920003,930005,940005,'Xiaomi Redmi Note 13 8GB 256GB','xiaomi-redmi-note-13-8gb-256gb','Redmi Note 13 với màn hình AMOLED 120Hz, RAM 8GB và bộ nhớ 256GB.','https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',5990000,0,0,0,'ACTIVE',0),
 (960028,920003,930005,940006,'Pin sạc dự phòng Anker 10000mAh','pin-sac-du-phong-anker-10000mah','Pin sạc dự phòng 10000mAh hỗ trợ sạc nhanh hai chiều qua cổng USB-C.','https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800',790000,0,0,0,'ACTIVE',0),
 (960029,920003,930005,940006,'Củ sạc Anker Nano 30W USB-C','cu-sac-anker-nano-30w-usb-c','Củ sạc GaN công suất 30W, hỗ trợ USB-C Power Delivery và nhiều chuẩn bảo vệ.','https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800',450000,0,0,0,'ACTIVE',0),
 (960030,920003,930007,940007,'Laptop Lenovo ThinkBook 14 G6','laptop-lenovo-thinkbook-14-g6','ThinkBook 14 G6 màn hình 14 inch, vỏ nhôm và bảo mật vân tay.','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',22990000,0,0,0,'ACTIVE',0),
 (960031,920003,930007,940008,'Laptop Dell Inspiron 15 3530','laptop-dell-inspiron-15-3530','Dell Inspiron 15 3530 màn hình 15.6 inch, phù hợp học tập và xử lý công việc.','https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',28990000,0,0,0,'ACTIVE',0),
 (960032,920003,930012,940009,'Chuột không dây Logitech M650','chuot-khong-day-logitech-m650','Chuột không dây công thái học, kết nối Bluetooth hoặc USB receiver.','https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',490000,0,0,0,'ACTIVE',0),
 (960033,920003,930012,940009,'Bàn phím cơ Logitech K835','ban-phim-co-logitech-k835','Bàn phím cơ layout đầy đủ, khung nhôm và switch tactile.','https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',1290000,0,0,0,'ACTIVE',0),
 (960034,920003,930012,NULL,'Hub USB-C 6 trong 1','hub-usb-c-6-trong-1','Hub USB-C gồm HDMI, USB-A, đầu đọc thẻ và sạc xuyên qua USB-C.','https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800',650000,0,0,0,'ACTIVE',0),
 (960035,920001,930003,940002,'Bình giữ nhiệt inox 750ml','binh-giu-nhiet-inox-750ml','Bình inox hai lớp giữ nóng lạnh, nắp kín chống rò và dung tích 750ml.','https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',390000,0,0,0,'ACTIVE',0),
 (960036,920001,930003,940002,'Ghế làm việc lưng lưới','ghe-lam-viec-lung-luoi','Ghế làm việc lưng lưới có tựa đầu, điều chỉnh chiều cao và tay vịn.','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',3200000,0,0,0,'ACTIVE',0)
ON DUPLICATE KEY UPDATE shop_id=VALUES(shop_id),category_id=VALUES(category_id),brand_id=VALUES(brand_id),name=VALUES(name),slug=VALUES(slug),description=VALUES(description),thumbnail_url=VALUES(thumbnail_url),price=VALUES(price),sold_count=VALUES(sold_count),rating_avg=VALUES(rating_avg),rating_count=VALUES(rating_count),status=VALUES(status),is_deleted=VALUES(is_deleted);

INSERT INTO product_images (id,product_id,url,sort_order,is_primary) VALUES
 (960101,960001,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',1,1),
 (960102,960001,'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800',2,0),
 (960103,960002,'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',1,1),
 (960104,960003,'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',1,1),
 (960105,960004,'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',1,1),
 (960106,960005,'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',1,1),
 (960107,960006,'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',1,1),
 (960108,960007,'https://images.unsplash.com/photo-1603313011105-34b1b4e5e9f1?w=800',1,1),
 (960109,960008,'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',1,1),
 (960110,960009,'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',1,1),
 (960111,960010,'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',1,1),
 (960112,960011,'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',1,1),
 (960113,960012,'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800',1,1),
 (960114,960013,'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',1,1),
 (960115,960014,'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',1,1),
 (960116,960015,'https://images.unsplash.com/photo-1625910513413-5fc45e8e4a0f?w=800',1,1),
 (960117,960016,'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800',1,1),
 (960118,960017,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',1,1),
 (960119,960018,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',1,1),
 (960120,960019,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',1,1),
 (960121,960020,'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800',1,1),
 (960122,960021,'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',1,1),
 (960123,960022,'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',1,1),
 (960124,960023,'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',1,1),
 (960125,960024,'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',1,1),
 (960126,960025,'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',1,1),
 (960127,960026,'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',1,1),
 (960128,960027,'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',1,1),
 (960129,960028,'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800',1,1),
 (960130,960029,'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800',1,1),
 (960131,960030,'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',1,1),
 (960132,960031,'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',1,1),
 (960133,960032,'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',1,1),
 (960134,960033,'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',1,1),
 (960135,960034,'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800',1,1),
 (960136,960035,'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',1,1),
 (960137,960036,'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',1,1)
ON DUPLICATE KEY UPDATE product_id=VALUES(product_id),url=VALUES(url),sort_order=VALUES(sort_order),is_primary=VALUES(is_primary);

INSERT INTO product_variants (id,product_id,sku,name,price,stock,status) VALUES
 (961001,960001,'AN-NHIEN-TEE-BLK-M','Đen / M',250000,24,'ACTIVE'),
 (961002,960001,'AN-NHIEN-TEE-WHT-L','Trắng / L',250000,11,'ACTIVE'),
 (961003,960002,'AN-NHIEN-TOTE-NAT','Màu tự nhiên',180000,35,'ACTIVE'),
 (961004,960003,'BEP-MOC-COFFEE-250','Gói 250g',145000,40,'ACTIVE'),
 (961005,960004,'APPLE-IP15PM-256','256GB / Titan tự nhiên',29990000,12,'ACTIVE'),
 (961006,960005,'APPLE-IP15P-128','128GB / Titan đen',25990000,9,'ACTIVE'),
 (961007,960006,'APPLE-IP15-128','128GB / Xanh dương',19990000,14,'ACTIVE'),
 (961008,960007,'CASE-IP15PM-CLEAR','Trong suốt',390000,30,'ACTIVE'),
 (961009,960008,'CABLE-USBC-20W-1M','USB-C / 1m',190000,45,'ACTIVE'),
 (961010,960009,'CHARGER-USBC-30W','USB-C / 30W',100000,12,'ACTIVE'),
 (961011,960010,'AN-NHIEN-JACKET-BLK-M','Đen / M',650000,5,'ACTIVE'),
 (961012,960010,'AN-NHIEN-JACKET-WHT-L','Trắng / L',650000,4,'ACTIVE'),
 (961013,960011,'LENOVO-IDEAPAD-I5-16-512','Core i5 / 16GB / 512GB',22990000,3,'ACTIVE'),
 (961014,960011,'LENOVO-IDEAPAD-I7-32-1TB','Core i7 / 32GB / 1TB',32990000,2,'ACTIVE'),
 (961015,960016,'AN-NHIEN-DENIM-BLK-M','Đen / M',890000,6,'ACTIVE'),
 (961016,960016,'AN-NHIEN-DENIM-WHT-L','Trắng / L',890000,4,'ACTIVE'),
 (961017,960012,'AN-NHIEN-LINEN-SHIRT','Trắng / M',490000,18,'ACTIVE'),
 (961018,960013,'AN-NHIEN-JEANS-STRAIGHT','Xanh denim / 30',690000,12,'ACTIVE'),
 (961019,960014,'AN-NHIEN-HOODIE-COTTON','Xám / M',590000,15,'ACTIVE'),
 (961020,960015,'AN-NHIEN-POLO-PIQUE','Xanh navy / M',320000,20,'ACTIVE'),
 (961021,960017,'AN-NHIEN-CANVAS-BACKPACK','Đen / 15 inch',790000,8,'ACTIVE'),
 (961022,960018,'AN-NHIEN-SNEAKER-URBAN','Trắng / 40',1200000,10,'ACTIVE'),
 (961023,960019,'BEPVIET-LED-DESK-LAMP','Trắng / 3 mức sáng',450000,14,'ACTIVE'),
 (961024,960020,'BEPVIET-OAK-DESK-TRAY','Gỗ sồi / 30cm',220000,16,'ACTIVE'),
 (961025,960021,'BEPVIET-CERAMIC-CUP-350','Men trắng / 350ml',180000,24,'ACTIVE'),
 (961026,960022,'BEPVIET-INDUCTION-POT-20','Inox / 20cm',1100000,7,'ACTIVE'),
 (961027,960023,'BEP-MOC-COFFEE-GROUND-500','Gói 500g',210000,30,'ACTIVE'),
 (961028,960024,'KHE-SANH-ARABICA-250','Gói 250g',220000,20,'ACTIVE'),
 (961029,960025,'APPLE-IP15PLUS-128','128GB / Hồng',22990000,8,'ACTIVE'),
 (961030,960026,'SAMSUNG-A55-128','128GB / Xanh navy',9990000,11,'ACTIVE'),
 (961031,960027,'XIAOMI-REDMI-NOTE13-256','256GB / Đen',5990000,13,'ACTIVE'),
 (961032,960028,'ANKER-POWERBANK-10K','10000mAh / Đen',790000,17,'ACTIVE'),
 (961033,960029,'ANKER-NANO-30W','USB-C / 30W',450000,21,'ACTIVE'),
 (961034,960030,'LENOVO-THINKBOOK-I5-16-512','Core i5 / 16GB / 512GB',22990000,4,'ACTIVE'),
 (961035,960030,'LENOVO-THINKBOOK-I7-32-1TB','Core i7 / 32GB / 1TB',28990000,2,'ACTIVE'),
 (961036,960031,'DELL-INSPIRON-I5-16-512','Core i5 / 16GB / 512GB',28990000,5,'ACTIVE'),
 (961037,960031,'DELL-INSPIRON-I7-32-1TB','Core i7 / 32GB / 1TB',34990000,2,'ACTIVE'),
 (961038,960032,'LOGITECH-M650-WIRELESS','Bluetooth / USB receiver',490000,19,'ACTIVE'),
 (961039,960033,'LOGITECH-K835-KEYBOARD','Switch tactile / USB',1290000,6,'ACTIVE'),
 (961040,960034,'USB-C-HUB-6IN1','HDMI / USB-C / USB-A',650000,12,'ACTIVE'),
 (961041,960035,'BEPVIET-THERMAL-BOTTLE-750','Inox / 750ml',390000,22,'ACTIVE'),
 (961042,960036,'BEPVIET-MESH-OFFICE-CHAIR','Lưng lưới / điều chỉnh',3200000,3,'ACTIVE')
ON DUPLICATE KEY UPDATE product_id=VALUES(product_id),name=VALUES(name),price=VALUES(price),stock=VALUES(stock),status=VALUES(status);

INSERT INTO variant_attribute_values (variant_id,attribute_value_id) VALUES
 (961001,951001),(961001,951003),(961002,951002),(961002,951004),
 (961011,951001),(961011,951003),(961012,951002),(961012,951004),
 (961013,951005),(961013,951007),(961013,951009),
 (961014,951006),(961014,951008),(961014,951010),
 (961015,951001),(961015,951003),(961016,951002),(961016,951004),
 (961034,951005),(961034,951007),(961034,951009),
 (961035,951006),(961035,951008),(961035,951010),
 (961036,951005),(961036,951007),(961036,951009),
 (961037,951006),(961037,951008),(961037,951010)
ON DUPLICATE KEY UPDATE variant_id=VALUES(variant_id);

INSERT INTO stock_movements (id,variant_id,change_qty,stock_after,reason,created_by) VALUES
 (962001,961001,25,25,'RESTOCK',900002),
 (962002,961002,11,11,'RESTOCK',900002),
 (962003,961003,35,35,'RESTOCK',900002),
 (962004,961004,40,40,'RESTOCK',900004),
 (962005,961001,-1,24,'ORDER',900003),
 (962006,961005,13,13,'RESTOCK',900007),
 (962007,961005,-1,12,'ORDER',900003),
 (962008,961006,9,9,'RESTOCK',900007),
 (962009,961007,14,14,'RESTOCK',900007),
 (962010,961008,30,30,'RESTOCK',900007),
 (962011,961009,45,45,'RESTOCK',900007),
 (962012,961010,12,12,'RESTOCK',900007),
 (962013,961011,5,5,'RESTOCK',900002),
 (962014,961012,4,4,'RESTOCK',900002),
 (962015,961013,3,3,'RESTOCK',900007),
 (962016,961014,2,2,'RESTOCK',900007),
 (962017,961015,6,6,'RESTOCK',900002),
 (962018,961016,4,4,'RESTOCK',900002),
 (962019,961017,18,18,'RESTOCK',900002),
 (962020,961018,12,12,'RESTOCK',900002),
 (962021,961019,15,15,'RESTOCK',900002),
 (962022,961020,20,20,'RESTOCK',900002),
 (962023,961021,8,8,'RESTOCK',900002),
 (962024,961022,10,10,'RESTOCK',900002),
 (962025,961023,14,14,'RESTOCK',900002),
 (962026,961024,16,16,'RESTOCK',900002),
 (962027,961025,24,24,'RESTOCK',900002),
 (962028,961026,7,7,'RESTOCK',900002),
 (962029,961027,30,30,'RESTOCK',900004),
 (962030,961028,20,20,'RESTOCK',900002),
 (962031,961029,8,8,'RESTOCK',900007),
 (962032,961030,11,11,'RESTOCK',900007),
 (962033,961031,13,13,'RESTOCK',900007),
 (962034,961032,17,17,'RESTOCK',900007),
 (962035,961033,21,21,'RESTOCK',900007),
 (962036,961034,4,4,'RESTOCK',900007),
 (962037,961035,2,2,'RESTOCK',900007),
 (962038,961036,5,5,'RESTOCK',900007),
 (962039,961037,2,2,'RESTOCK',900007),
 (962040,961038,19,19,'RESTOCK',900007),
 (962041,961039,6,6,'RESTOCK',900007),
 (962042,961040,12,12,'RESTOCK',900007),
 (962043,961041,22,22,'RESTOCK',900002),
 (962044,961042,3,3,'RESTOCK',900002)
ON DUPLICATE KEY UPDATE variant_id=VALUES(variant_id),change_qty=VALUES(change_qty),stock_after=VALUES(stock_after),reason=VALUES(reason),created_by=VALUES(created_by);

INSERT INTO carts (id,user_id) VALUES (970001,900003)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);
INSERT INTO cart_items (id,cart_id,variant_id,quantity) VALUES (970101,970001,961001,2),(970102,970001,961003,1)
ON DUPLICATE KEY UPDATE cart_id=VALUES(cart_id),variant_id=VALUES(variant_id),quantity=VALUES(quantity);
INSERT INTO wishlists (user_id,product_id) VALUES (900003,960002)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);

INSERT INTO shipping_methods (id,code,name,base_fee,estimated_days,is_active) VALUES
 (980001,'STANDARD','Giao hàng tiêu chuẩn',30000,'2-4 ngày',1),
 (980002,'EXPRESS','Giao hàng nhanh',50000,'1-2 ngày',1)
ON DUPLICATE KEY UPDATE name=VALUES(name),base_fee=VALUES(base_fee),estimated_days=VALUES(estimated_days),is_active=VALUES(is_active);
INSERT INTO payment_methods (id,code,name,is_active,sort_order) VALUES
 (980101,'COD','Thanh toán khi nhận hàng',1,1),
 (980102,'BANK_TRANSFER','Chuyển khoản ngân hàng',1,2),
 (980103,'MOCK_CARD','Thẻ thử nghiệm (không kết nối cổng thanh toán)',1,3)
ON DUPLICATE KEY UPDATE name=VALUES(name),is_active=VALUES(is_active),sort_order=VALUES(sort_order);

INSERT INTO vouchers (id,code,scope,shop_id,title,description,discount_type,discount_value,max_discount_amount,min_order_value,usage_limit,usage_per_user,used_count,start_at,end_at,is_active,created_by) VALUES
 (981001,'SEED-WELCOME','PLATFORM',NULL,'Giảm 50.000đ cho đơn từ 300.000đ','Ưu đãi chào mừng áp dụng cho đơn hàng toàn sàn.','FIXED',50000,NULL,300000,100,1,1,UTC_TIMESTAMP()-INTERVAL 1 DAY,UTC_TIMESTAMP()+INTERVAL 180 DAY,1,900001),
 (981002,'SEED-MAY10','SHOP',920001,'Giảm 10% tối đa 40.000đ','Ưu đãi thành viên của An Nhiên Living.','PERCENT',10,40000,200000,50,1,1,UTC_TIMESTAMP()-INTERVAL 1 DAY,UTC_TIMESTAMP()+INTERVAL 90 DAY,1,900002)
ON DUPLICATE KEY UPDATE scope=VALUES(scope),shop_id=VALUES(shop_id),title=VALUES(title),description=VALUES(description),discount_type=VALUES(discount_type),discount_value=VALUES(discount_value),max_discount_amount=VALUES(max_discount_amount),min_order_value=VALUES(min_order_value),usage_limit=VALUES(usage_limit),usage_per_user=VALUES(usage_per_user),used_count=VALUES(used_count),start_at=VALUES(start_at),end_at=VALUES(end_at),is_active=VALUES(is_active),created_by=VALUES(created_by);

INSERT INTO orders (id,order_code,user_id,recipient_name,recipient_phone,shipping_address,payment_method_id,shipping_method_id,platform_voucher_id,subtotal,shipping_fee,platform_discount,shop_discount_total,total_amount,note) VALUES
 (990001,'SEED-ORDER-001',900003,'Trần Ngọc Hà','+84910000003','12 Phố Duy Tân, Dịch Vọng, Cầu Giấy, Hà Nội',980101,980001,981001,30240000,30000,50000,25000,30195000,'Đơn hàng hoàn tất gồm sản phẩm thời trang và điện thoại từ hai cửa hàng.')
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id),recipient_name=VALUES(recipient_name),recipient_phone=VALUES(recipient_phone),shipping_address=VALUES(shipping_address),payment_method_id=VALUES(payment_method_id),shipping_method_id=VALUES(shipping_method_id),platform_voucher_id=VALUES(platform_voucher_id),subtotal=VALUES(subtotal),shipping_fee=VALUES(shipping_fee),platform_discount=VALUES(platform_discount),shop_discount_total=VALUES(shop_discount_total),total_amount=VALUES(total_amount),note=VALUES(note);

INSERT INTO shop_orders (id,order_id,shop_id,shop_order_code,status,subtotal,shipping_fee,shop_voucher_id,shop_discount,platform_discount,total_amount,commission_rate,commission_amount,carrier,tracking_code,confirmed_at,packed_at,shipped_at,completed_at) VALUES
 (991001,990001,920001,'SEED-SHOP-ORDER-001','COMPLETED',250000,20000,981002,25000,15000,230000,8,18000,'Viettel Post','VTPOST-SEED-001',UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP()),
 (991002,990001,920003,'SEED-SHOP-ORDER-002','COMPLETED',29990000,10000,NULL,0,35000,29965000,5,1499500,'Giao Hàng Nhanh','GHN-SEED-002',UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP())
ON DUPLICATE KEY UPDATE order_id=VALUES(order_id),shop_id=VALUES(shop_id),status=VALUES(status),subtotal=VALUES(subtotal),shipping_fee=VALUES(shipping_fee),shop_voucher_id=VALUES(shop_voucher_id),shop_discount=VALUES(shop_discount),platform_discount=VALUES(platform_discount),total_amount=VALUES(total_amount),commission_rate=VALUES(commission_rate),commission_amount=VALUES(commission_amount),carrier=VALUES(carrier),tracking_code=VALUES(tracking_code),confirmed_at=VALUES(confirmed_at),packed_at=VALUES(packed_at),shipped_at=VALUES(shipped_at),completed_at=VALUES(completed_at);

INSERT INTO order_items (id,shop_order_id,product_id,variant_id,product_name,variant_name,sku,image_url,unit_price,quantity,line_total) VALUES
 (992001,991001,960001,961001,'Áo thun cotton Everyday','Đen / M','AN-NHIEN-TEE-BLK-M','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',250000,1,250000),
 (992003,991002,960004,961005,'Apple iPhone 15 Pro Max 256GB','256GB / Titan tự nhiên','APPLE-IP15PM-256','https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',29990000,1,29990000)
ON DUPLICATE KEY UPDATE shop_order_id=VALUES(shop_order_id),product_id=VALUES(product_id),variant_id=VALUES(variant_id),product_name=VALUES(product_name),variant_name=VALUES(variant_name),sku=VALUES(sku),image_url=VALUES(image_url),unit_price=VALUES(unit_price),quantity=VALUES(quantity),line_total=VALUES(line_total);

INSERT INTO order_status_history (id,shop_order_id,from_status,to_status,changed_by,note) VALUES
 (993001,991001,NULL,'PENDING',900003,'Đơn hàng được tạo.'),
 (993002,991001,'PENDING','CONFIRMED',900002,'Cửa hàng xác nhận đơn hàng.'),
 (993003,991001,'CONFIRMED','PACKING',900002,'Cửa hàng đang đóng gói sản phẩm.'),
 (993004,991001,'PACKING','SHIPPING',900002,'Đơn hàng đã bàn giao cho đơn vị vận chuyển.'),
 (993005,991001,'SHIPPING','COMPLETED',900002,'Đơn hàng đã giao thành công.'),
 (993006,991002,NULL,'PENDING',900003,'Đơn hàng được tạo.'),
 (993007,991002,'PENDING','CONFIRMED',900007,'Cửa hàng xác nhận đơn hàng.'),
 (993008,991002,'CONFIRMED','PACKING',900007,'Cửa hàng đang chuẩn bị hàng.'),
 (993009,991002,'PACKING','SHIPPING',900007,'Đơn hàng đã bàn giao cho đơn vị vận chuyển.'),
 (993010,991002,'SHIPPING','COMPLETED',900007,'Đơn hàng đã giao thành công.')
ON DUPLICATE KEY UPDATE shop_order_id=VALUES(shop_order_id),from_status=VALUES(from_status),to_status=VALUES(to_status),changed_by=VALUES(changed_by),note=VALUES(note);

INSERT INTO voucher_usages (id,voucher_id,user_id,order_id,discount_amount) VALUES
 (994001,981001,900003,990001,50000),
 (994002,981002,900003,990001,25000)
ON DUPLICATE KEY UPDATE voucher_id=VALUES(voucher_id),user_id=VALUES(user_id),order_id=VALUES(order_id),discount_amount=VALUES(discount_amount);
INSERT INTO payments (id,order_id,payment_method_id,amount,status,transaction_ref,provider_data,paid_at) VALUES
 (995001,990001,980101,30195000,'PAID','SEED-PAYMENT-001',JSON_OBJECT('source','local-seed','gateway','local-test'),UTC_TIMESTAMP())
ON DUPLICATE KEY UPDATE order_id=VALUES(order_id),payment_method_id=VALUES(payment_method_id),amount=VALUES(amount),status=VALUES(status),transaction_ref=VALUES(transaction_ref),provider_data=VALUES(provider_data),paid_at=VALUES(paid_at);

INSERT INTO return_requests (id,shop_order_id,user_id,type,reason,status,refund_amount,handled_by,handled_note) VALUES
 (996001,991001,900003,'REFUND','Sản phẩm không còn phù hợp nhu cầu, khách gửi yêu cầu hoàn tiền sau khi nhận hàng.','REQUESTED',NULL,NULL,NULL)
ON DUPLICATE KEY UPDATE shop_order_id=VALUES(shop_order_id),user_id=VALUES(user_id),type=VALUES(type),reason=VALUES(reason),status=VALUES(status),refund_amount=VALUES(refund_amount),handled_by=VALUES(handled_by),handled_note=VALUES(handled_note);
INSERT INTO reviews (id,order_item_id,product_id,shop_id,user_id,rating,content,status,shop_reply,shop_replied_at) VALUES
 (997001,992001,960001,920001,900003,5,'Chất vải mềm, đúng mô tả và giao hàng đúng hẹn.','VISIBLE','Cảm ơn chị Hà đã tin tưởng An Nhiên Living.',UTC_TIMESTAMP())
ON DUPLICATE KEY UPDATE order_item_id=VALUES(order_item_id),product_id=VALUES(product_id),shop_id=VALUES(shop_id),user_id=VALUES(user_id),rating=VALUES(rating),content=VALUES(content),status=VALUES(status),shop_reply=VALUES(shop_reply),shop_replied_at=VALUES(shop_replied_at);
INSERT INTO review_images (id,review_id,url) VALUES
 (998001,997001,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800')
ON DUPLICATE KEY UPDATE review_id=VALUES(review_id),url=VALUES(url);
INSERT INTO notifications (id,user_id,type,title,content,link_url,is_read) VALUES
 (999001,900003,'ORDER_STATUS','Đơn hàng đã hoàn tất','Đơn hàng SEED-ORDER-001 đã được giao thành công.','/orders/SEED-ORDER-001',0),
 (999002,900002,'PROMOTION','Cửa hàng đã sẵn sàng','An Nhiên Living đang hoạt động và có thể nhận đơn hàng.','/seller',1)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id),type=VALUES(type),title=VALUES(title),content=VALUES(content),link_url=VALUES(link_url),is_read=VALUES(is_read);
INSERT INTO audit_logs (id,user_id,action,entity_type,entity_id,old_value,new_value,ip_address) VALUES
 (1000001,900001,'SEED_CREATED','PRODUCT',960001,NULL,JSON_OBJECT('source','local-seed'), '127.0.0.1')
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id),action=VALUES(action),entity_type=VALUES(entity_type),entity_id=VALUES(entity_id),old_value=VALUES(old_value),new_value=VALUES(new_value),ip_address=VALUES(ip_address);

-- No rows are seeded into refresh_tokens, auth_refresh_history, or
-- password_reset_otps: these are live security state, not fixture data.
COMMIT;
