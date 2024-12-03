-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: book_review
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('485e5e28-5356-476a-a6c7-280ceb779610','6aaccd2a7843bfd6c0b579b4ac4ee93bf039a81b6d7ed95d1c2b5a390a99a203','2024-11-14 03:10:48.038','20241114031047_init',NULL,NULL,'2024-11-14 03:10:47.752',1),('bca378d7-c891-4b9e-ae08-c6f9c5d493f4','618bfd61a71154d31c2692763e1fad7d3d951534cbdb351a6860d511d098bfe2','2024-11-14 03:10:47.464','20241111062901_add_phone_field',NULL,NULL,'2024-11-14 03:10:47.427',1),('d88b2cf3-8ede-4962-8fb8-4d3e53875277','f642461fc2166bb31065f3574f9b5c6fb6a8491098203f35d3ca974ba4c979c1','2024-11-14 03:54:07.683','20241114035407_init',NULL,NULL,'2024-11-14 03:54:07.135',1),('fa2402f6-448a-43e6-8f0b-cfae3ef2f91f','ec7e99a2735ef30d76f172fb11ab8714ffb8328c87c9aaac968556c7937d91f6','2024-11-14 03:10:47.422','20241111042818_add_email_verification',NULL,NULL,'2024-11-14 03:10:47.303',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `parentId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `comments_userId_fkey` (`username`),
  KEY `reviewId` (`reviewId`),
  KEY `parentId` (`parentId`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`reviewId`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,'가자, 까라마조프로!','라이영',42,'2024-11-18 08:20:16.000','2024-11-18 08:20:16.000',NULL),(2,'/????','라이영',43,'2024-11-18 08:21:54.000','2024-11-18 08:21:54.000',NULL),(3,'일ㅈ/////','라이영',35,'2024-11-18 08:24:03.000','2024-11-18 08:24:03.000',NULL),(4,'보통이라니?','라이영',34,'2024-11-18 08:28:08.000','2024-11-18 08:28:08.000',NULL),(5,'이거 아니잖아','라이영',34,'2024-11-18 08:28:38.000','2024-11-18 08:28:38.000',NULL),(9,'공자가 아직도 안 죽었나?','라이구',40,'2024-11-20 07:45:44.000','2024-11-20 07:45:44.000',NULL),(10,'저도 좋아 해요','라이구',42,'2024-11-22 02:06:05.000','2024-11-22 02:06:05.000',1),(11,'##&%$#$%^&*(?','라이구',43,'2024-11-22 02:33:22.000','2024-11-22 02:33:22.000',2),(12,'다음 리뷰도 기대됩니다.','라이영',47,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(13,'정말 흥미로운 내용이네요!','라이영',48,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(14,'좋은 정보 감사합니다.','라이영',49,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(15,'이런 관점으로도 볼 수 있군요.','라이영',50,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(16,'다음 리뷰도 기대됩니다.','라이영',51,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(17,'정말 흥미로운 내용이네요!','라이영',52,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(18,'좋은 정보 감사합니다.','라이영',53,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(19,'이런 관점으로도 볼 수 있군요.','라이영',54,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(20,'다음 리뷰도 기대됩니다.','라이영',55,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(21,'정말 흥미로운 내용이네요!','라이영',56,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(22,'좋은 정보 감사합니다.','라이영',57,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(23,'이런 관점으로도 볼 수 있군요.','라이영',58,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(24,'다음 리뷰도 기대됩니다.','라이영',59,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(25,'정말 흥미로운 내용이네요!','라이영',60,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(26,'좋은 정보 감사합니다.','라이영',61,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(27,'이런 관점으로도 볼 수 있군요.','라이영',62,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(28,'다음 리뷰도 기대됩니다.','라이영',63,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(29,'정말 흥미로운 내용이네요!','라이영',64,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(30,'좋은 정보 감사합니다.','라이영',65,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(31,'이런 관점으로도 볼 수 있군요.','라이영',66,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(32,'다음 리뷰도 기대됩니다.','라이영',67,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL),(33,'정말 흥미로운 내용이네요!','라이영',68,'2024-11-22 15:43:07.000','2024-11-22 15:43:07.000',NULL);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verifications`
--

DROP TABLE IF EXISTS `email_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_verifications_token_key` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verifications`
--

LOCK TABLES `email_verifications` WRITE;
/*!40000 ALTER TABLE `email_verifications` DISABLE KEYS */;
INSERT INTO `email_verifications` VALUES (2,'rhiyoung@hanmail.net','3bb812c949c85d141fc0b15b332cf1344f8d3e0ae1ac5560ec8a1bec399daccf',1,'2024-11-19 08:37:26.056','2024-11-18 08:37:26.059'),(24,'rhiyoung@naver.com','0221e8e96768f2682c9eb07a49159da1dd11b25465f61fba41f741556da669b1',1,'2024-11-29 07:42:25.347','2024-11-28 07:42:25.350');
/*!40000 ALTER TABLE `email_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bookTitle` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `views` int NOT NULL DEFAULT '0',
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `publisher` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bookAuthor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,'인상 깊었던 소설','데미안','헤르만 헤세의 대표작을 읽고 깊은 통찰을 얻었습니다. 자아를 찾아가는 과정이 인상적이었어요.',0,'책벌레','2024-01-01 10:00:00.000','2024-01-01 10:00:00.000','민음사','헤르만 헤세'),(2,'필독서로 추천합니다','1984','디스토피아 세계관을 잘 그려낸 작품입니다. 현대 사회에도 시사하는 바가 큽니다.',0,'독서광','2024-01-03 11:00:00.000','2024-01-03 11:00:00.000','문학동네','조지 오웰'),(3,'마음을 울리는 시','풀꽃','나태주 시인의 섬세한 시선이 돋보이는 시집입니다.',0,'시인의마음','2024-01-05 12:00:00.000','2024-01-05 12:00:00.000','창비','나태주'),(4,'고전의 재발견','변신','카프카의 부조리한 세계관을 잘 표현한 소설입니다.',0,'문학청년','2024-01-07 13:00:00.000','2024-01-07 13:00:00.000','문학과지성사','프란츠 카프카'),(5,'현대인의 필독서','사피엔스','인류의 역사를 거시적 관점에서 바라본 흥미로운 책입니다.',0,'지식탐험가','2024-01-09 14:00:00.000','2024-01-09 14:00:00.000','김영사','유발 하라리'),(6,'마음을 치유하는 책','아몬드','공감 능력에 대해 생각해보게 만드는 소설입니다.',0,'책으로치유','2024-01-11 15:00:00.000','2024-01-11 15:00:00.000','창비','손원평'),(7,'인생의 지혜','철학이 필요한 시간','일상적인 고민들을 철학적으로 풀어낸 책입니다.',1,'철학자','2024-01-13 16:00:00.000','2024-11-20 06:58:42.000','인플루엔셜','강신주'),(8,'재미있는 과학책','코스모스','우주와 과학에 대한 흥미로운 통찰을 제공합니다.',0,'과학덕후','2024-01-15 17:00:00.000','2024-01-15 17:00:00.000','사이언스북스','칼 세이건'),(9,'경제 입문서로 좋아요','부의 추월차선','재테크에 대한 새로운 관점을 제시하는 책입니다.',0,'경제인','2024-01-17 18:00:00.000','2024-01-17 18:00:00.000','토트','M.J. 드마코'),(10,'심리학의 세계','멈추면, 비로소 보이는 것들','혜민 스님의 통찰력 있는 이야기가 위로가 됩니다.',0,'마음탐험가','2024-01-19 19:00:00.000','2024-01-19 19:00:00.000','수오서재','혜민'),(11,'영미문학의 걸작','위대한 개츠비','1920년대 미국 사회를 섬세하게 그려낸 명작입니다.',0,'문학소녀','2024-01-21 20:00:00.000','2024-01-21 20:00:00.000','민음사','F. 스콧 피츠제럴드'),(12,'한국문학의 자부심','채식주의자','독특한 소재와 묘사가 인상적인 작품입니다.',0,'문학애호가','2024-01-23 21:00:00.000','2024-01-23 21:00:00.000','창비','한강'),(13,'추리소설의 정석','셜록 홈즈','추리소설의 대명사, 시간이 지나도 재미있습니다.',0,'추리왕','2024-01-25 22:00:00.000','2024-01-25 22:00:00.000','황금가지','아서 코난 도일'),(14,'청소년 필독서','어린왕자','순수함과 진정한 사랑에 대해 생각하게 만드는 책입니다.',0,'책읽는학생','2024-01-27 23:00:00.000','2024-01-27 23:00:00.000','문학동네','생텍쥐페리'),(15,'일본 문학의 진수','상실의 시대','무라카미 하루키의 섬세한 감성이 돋보이는 작품입니다.',0,'독서매니아','2024-01-29 10:00:00.000','2024-01-29 10:00:00.000','문학사상','무라카미 하루키'),(16,'현대시 걸작','서울의 달빛','정현종 시인의 아름다운 시 세계를 만날 수 있습니다.',0,'시낭송가','2024-01-31 11:00:00.000','2024-01-31 11:00:00.000','민음사','정현종'),(17,'철학 입문서로 좋아요','소크라테스의 변명','철학의 기초를 다지기 좋은 책입니다.',0,'철학도','2024-02-02 12:00:00.000','2024-02-02 12:00:00.000','문예출판사','플라톤'),(18,'SF 걸작선','안드로이드는 전기양을 꿈꾸는가','SF의 고전, 인간성에 대해 생각하게 합니다.',0,'공상가','2024-02-04 13:00:00.000','2024-02-04 13:00:00.000','황금가지','필립 K. 딕'),(19,'에세이 추천','보노보노처럼 살다니 다행이야','일상의 소소한 행복을 발견하게 해주는 책입니다.',0,'글쓰는이','2024-02-06 14:00:00.000','2024-02-06 14:00:00.000','놀','김신회'),(20,'역사책 추천','총, 균, 쇠','인류 문명의 발전 과정을 흥미롭게 설명한 책입니다.',0,'역사탐험가','2024-02-08 15:00:00.000','2024-02-08 15:00:00.000','문학사상','재레드 다이아몬드'),(21,'인문학 교양서','라틴어 수업','고전을 통해 현대를 바라보는 시선이 인상적입니다.',0,'인문학도','2024-02-10 16:00:00.000','2024-02-10 16:00:00.000','흐름출판','한동일'),(22,'자기계발서 추천','미라클 모닝','아침 습관의 중요성을 일깨워주는 책입니다.',0,'새벽독서','2024-02-12 17:00:00.000','2024-02-12 17:00:00.000','한빛비즈','할 엘로드'),(23,'심리학 교양서','프레임','우리의 사고방식을 이해하게 해주는 책입니다.',0,'마음읽기','2024-02-14 18:00:00.000','2024-02-14 18:00:00.000','21세기북스','최인철'),(24,'경제 교양서','넛지','행동경제학의 핵심을 쉽게 설명한 책입니다.',0,'경제연구가','2024-02-16 19:00:00.000','2024-02-16 19:00:00.000','리더스북','리처드 탈러'),(25,'과학 교양서','시간의 역사','호킹의 우주론을 쉽게 설명한 명저입니다.',0,'과학탐험가','2024-02-18 20:00:00.000','2024-02-18 20:00:00.000','까치','스티븐 호킹'),(26,'예술 에세이','빈센트 반 고흐','예술가의 삶과 작품 세계를 잘 담아낸 책입니다.',0,'예술가의눈','2024-02-20 21:00:00.000','2024-02-20 21:00:00.000','예담','스티븐 나이피'),(27,'여행 에세이','나의 한국문화유산답사기','우리 문화재를 쉽고 재미있게 설명한 책입니다.',0,'문화탐방','2024-02-22 22:00:00.000','2024-02-22 22:00:00.000','창비','유홍준'),(28,'음악 이야기','클래식의 정석','클래식 음악의 이해를 돕는 좋은 입문서입니다.',0,'음악애호가','2024-02-24 23:00:00.000','2024-02-24 23:00:00.000','음악세계','장일범'),(29,'환경 도서','침묵의 봄','환경 문제의 심각성을 일깨워준 고전입니다.',0,'자연사랑','2024-02-26 10:00:00.000','2024-02-26 10:00:00.000','에코리브르','레이첼 카슨'),(30,'정치학 입문','민주주의의 수수께끼','현대 민주주의를 이해하기 좋은 책입니다.',0,'정치학도','2024-02-28 11:00:00.000','2024-02-28 11:00:00.000','후마니타스','로버트 달'),(31,'철학의 즐거움','소피의 세계','청소년을 위한 철학 입문서로 훌륭합니다. 철학의 역사를 소설처럼 재미있게 풀어냈어요.',0,'인문학도','2024-03-01 10:00:00.000','2024-03-01 10:00:00.000','현암사','요슈타인 가아더'),(32,'마음의 지도','생각의 지도','철학적 사고를 시각화하는 방법을 알려주는 책입니다.',0,'새벽독서','2024-03-02 11:00:00.000','2024-03-02 11:00:00.000','김영사','리처드 니스벳'),(33,'일본 문학 걸작','노르웨이의 숲','무라카미 하루키의 섬세한 감성이 돋보이는 작품입니다.',0,'독서매니아','2024-03-03 12:00:00.000','2024-03-03 12:00:00.000','문학사상','무라카미 하루키'),(34,'서양철학 이야기','철학의 위안','고대 철학자들의 지혜를 현대적으로 재해석한 책입니다.',2,'인문학도','2024-03-04 13:00:00.000','2024-11-18 08:35:00.000','동녘','알랭 드 보통'),(35,'아침이 달라지는 책','새벽 4시의 습관','이른 아침 시간을 효율적으로 활용하는 방법을 알려줍니다.',3,'새벽독서','2024-03-05 14:00:00.000','2024-11-18 08:36:01.000','위즈덤하우스','김유진'),(36,'한국 소설의 힘','파친코','재미교포 작가의 시선으로 본 한국인의 이야기입니다.',1,'독서매니아','2024-03-06 15:00:00.000','2024-11-18 07:33:18.000','문학사상','이민진'),(37,'철학적 사고','니체의 말','니체 철학을 쉽게 풀어낸 입문서입니다.',0,'인문학도','2024-03-07 16:00:00.000','2024-03-07 16:00:00.000','필로소픽','프리드리히 니체'),(38,'독서의 기술','독서의 즐거움','효과적인 독서법과 독서의 의미를 다룬 책입니다.',2,'새벽독서','2024-03-08 17:00:00.000','2024-11-18 07:41:05.000','을유문화사','해롤드 블룸'),(39,'세계 문학 기행','백년의 고독','마술적 리얼리즘의 대표작을 읽고 깊은 감동을 받았습니다.',2,'독서매니아','2024-03-09 18:00:00.000','2024-11-18 07:58:19.000','민음사','가브리엘 가르시아 마르케스'),(40,'동양철학 산책','논어','공자의 가르침을 현대적으로 해석한 책입니다.',3,'인문학도','2024-03-10 19:00:00.000','2024-11-20 07:45:23.000','창비','공자'),(41,'새벽의 독서','습관의 힘','좋은 습관을 만드는 과학적인 방법을 소개합니다.',2,'새벽독서','2024-03-11 20:00:00.000','2024-11-18 07:32:04.000','웅진지식하우스','제임스 클리어'),(42,'러시아 문학 명작','죄와 벌','도스토예프스키의 걸작을 다시 읽었습니다.',6,'독서매니아','2024-03-12 21:00:00.000','2024-11-20 06:45:47.000','민음사','도스토예프스키'),(43,'현대철학 입문','존재와 무','사르트르의 실존주의 철학을 다룬 책입니다.',4,'인문학도','2024-03-13 22:00:00.000','2024-11-20 06:45:42.000','문예출판사','장폴 사르트르'),(45,'프랑스 문학 산책','이방인','카뮈의 부조리 철학이 돋보이는 작품입니다.',3,'독서매니아','2024-03-15 09:00:00.000','2024-11-20 06:45:22.000','민음사','알베르 카뮈'),(47,'SF가 아니라 설화집','인디케이터','여러 재미 있는 내용들, 특히 우리에게 익숙한 내용을 비틀어 이렇게 새로운 얘기로 만들 수 있었군요.',12,'라이구','2024-11-18 09:16:30.000','2024-11-22 02:04:11.000','국민서관','김호진'),(48,'구석기 시대인들을 다시 생각했다.','식인과 제왕','오해하기 딱 좋았다.',3,'라이구','2024-11-20 07:49:21.000','2024-11-22 01:46:32.000','한길사','마빈 해리스'),(49,'구석기 시대의 철학','철학의 역사','인류의 시작부터...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(50,'중세 시대의 과학','과학의 역사','중세 시대의 과학 발전은...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(51,'르네상스 예술','예술의 역사','르네상스 시대의 예술은...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(52,'고대 그리스의 수학','수학의 역사','피타고라스와 그의 제자들...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(53,'로마 제국의 건축','건축의 역사','콜로세움과 판테온...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(54,'이집트 문명의 발견','고고학 산책','나일강 유역의 문명...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(55,'메소포타미아의 신화','신화의 세계','길가메시 서사시...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(56,'중국 진나라의 통일','중국사 개론','진시황제의 업적...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(57,'한국 고대의 문화','한국의 역사','삼국시대의 문화...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(58,'일본 에도 시대','일본의 역사','도쿠가와 막부의...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(59,'산업혁명과 증기기관','산업의 역사','와트의 발명품...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(60,'프랑스 혁명의 원인','혁명의 역사','구체제의 모순...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(61,'러시아 혁명의 과정','20세기 역사','볼셰비키의 승리...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(62,'미국 독립 전쟁','미국의 역사','보스턴 차 사건...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(63,'제1차 세계대전','전쟁의 역사','사라예보 사건...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(64,'제2차 세계대전','현대사','진주만 기습...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(65,'냉전의 시작','국제 관계사','철의 장막 연설...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(66,'베를린 장벽의 붕괴','유럽의 역사','독일 통일...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(67,'아폴로 11호','우주 탐사사','달 착륙 성공...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(68,'컴퓨터의 발명','IT의 역사','에니악의 등장...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(69,'인터넷의 시작','통신의 역사','알파넷 개발...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL),(70,'스마트폰의 혁명','모바일의 역사','아이폰의 등장...',0,'라이구','2024-11-22 15:43:05.000','2024-11-22 15:43:05.000',NULL,NULL);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('[20241114143621]-add-publisher-column.js'),('[20241114150133]-add-bookAuthor-column.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_key` (`username`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'라이구','rhiyoung@hanmail.net','$2a$10$bxnEfa/JXBkpIHYFww3fMOCWKdbhDQUJgLheKnaamDIEBp0jVjA0u','010-1234-5679',0,'2024-11-18 17:38:42.000','2024-11-18 17:38:42.000');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-29 14:41:33
