import React, { useState, useEffect } from 'react';
import { Container, VStack, Box, Heading, Text, Image, Link, Flex } from '@chakra-ui/react';
import { fetchRecentPosts } from "../data/api/blog";

const BlogSection = ( posts ) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const recentPosts = await fetchRecentPosts();
        setPosts(recentPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

 return (
      <Container maxW="container.lg" mb="50px">
        <Heading fontWeight="500" mb={8} mt={20}>
          Shipping Log
        </Heading>
        {posts.map((post, index) => {
          const date = new Date(post.pubDate);
          const formattedDate = `${date.toLocaleString('default', { month: 'short' }).toUpperCase()} ${date.getDate()}`;

          return (
            <Link key={index} href={post.link} isExternal>
              <Box bg="transparent" w="full" mb={4}>
                <Box bg="white" rounded="md" shadow="md" w="full">
                  <Flex alignItems="stretch" justifyContent="space-between" w="full">
                    <VStack align="start" spacing={4} flex="1" p={6}>
                      <Heading as="h3" size="md">{post.title}</Heading>
                      <Text fontSize="sm" noOfLines={3}>{post.description}</Text>
                      <Text color="gray.400" fontSize="sm">{formattedDate}</Text>
                    </VStack>
                    <Image display={{ base: "none", sm: "block" }} maxW="200px" src={post.imageUrl} alt={post.title} objectFit="cover" />
                  </Flex>
                </Box>
              </Box>
            </Link>
          );
        })}
      </Container>
      );
};

export default BlogSection;
