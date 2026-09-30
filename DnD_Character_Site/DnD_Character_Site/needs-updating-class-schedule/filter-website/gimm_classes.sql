CREATE TABLE `gimm_classes` (
  `id` int NOT NULL,
  `major` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `class_number` int NOT NULL,
  `professor` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `gimm_classes`
--

INSERT INTO `gimm_classes` (`id`, `major`, `class_number`, `professor`) VALUES
(1, 'GIMM', 285, 'Jack Polifka'),
(2, 'GIMM', 290, 'Ted Apel'),
(3, 'GIMM', 250, 'Anthony Ellertson'),
(4, 'GIMM', 310, 'Anthony Ellertson'),
(5, 'GIMM', 440, 'Aaron Gluck'),
(6, 'GIMM', 360, 'Ted Apel'),
(7, 'GIMM', 200, 'Aaron Gluck'),
(8, 'GIMM', 490, 'Karen Doty'),
(9, 'GIMM', 200, 'Amod Damle'),
(10, 'GIMM', 370, 'Amod Damle'),
(11, 'GIMM', 300, 'Jack Polifka'),
(12, 'GIMM', 375, 'Karen Doty');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `gimm_classes`
--
ALTER TABLE `gimm_classes`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `gimm_classes`
--
ALTER TABLE `gimm_classes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=376;
COMMIT;