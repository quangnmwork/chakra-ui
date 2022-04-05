import { fireEvent, render, testA11y, waitFor } from "@chakra-ui/test-utils"
import * as React from "react"
import { screen } from "@testing-library/react"
import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import { Box, Badge, Container, Divider, Flex, Stack } from "../src"

describe("<Box />", () => {
  test("passes a11y test", async () => {
    await testA11y(<Box>this is a box</Box>)
  })

  test("as - prop works correctly", () => {
    render(
      <Box as="a" href="www.google.com">
        Box
      </Box>,
    )

    expect(screen.getByText("Box").nodeName).toBe("A")
  })
})

describe("<Badge />", () => {
  test("passes a11y test", async () => {
    await testA11y(<Badge>this is a badge</Badge>)
  })
})

describe("<Container />", () => {
  test("renders box correctly", () => {
    render(<Container>This is container</Container>)
  })

  test("centerContent - prop works correctly", () => {
    render(<Container centerContent>This is centered container</Container>)
  })

  test("theming works correctly", () => {
    const theme = extendTheme({
      components: {
        Container: {
          variants: {
            customBackground: {
              bgColor: "red.500",
            },
          },
        },
      },
    })
    render(
      <ChakraProvider theme={theme}>
        <Container variant="customBackground">
          This is container has a red background
        </Container>
      </ChakraProvider>,
    )
  })
})

describe("<Flex />", () => {
  test("renders all the allowed shorthand style props", () => {
    render(
      <Flex
        align="stretch"
        justify="start"
        wrap="nowrap"
        direction="row"
        basis="auto"
        grow={1}
        shrink={0}
      />,
    )
  })
})

describe("<Stack />", () => {
  const data = [
    { id: "apple" },
    { id: "orange" },
    { id: "banana" },
    { id: "mango" },
    { id: "kiwi" },
    { id: "pineapple" },
  ]
  interface FruitProps {
    name: string
    onUnmount?: (v: string) => void
  }
  const Fruit = ({ name, onUnmount }: FruitProps) => {
    React.useEffect(() => {
      return () => {
        if (onUnmount) onUnmount(name)
      }
    }, [])
    return <Flex data-testid="fruit">{name}</Flex>
  }

  test("renders list of items correctly", async () => {
    const Wrapper = ({ data }: { data: Record<string, any>[] }) => {
      return (
        <Stack>
          {data.map((i) => (
            <Fruit key={i.id} name={i.id} />
          ))}
        </Stack>
      )
    }

    render(<Wrapper data={data} />)
    const items = await screen.findAllByTestId("fruit")
    expect(items).toHaveLength(6)
  })

  test("renders list of items with provided keys when cloning children", async () => {
    const unMountMock = jest.fn()
    const Wrapper = ({ data }: { data: Record<string, any>[] }) => {
      const [fruits, setFruits] = React.useState(data)

      return (
        <>
          <Box
            onClick={() => {
              setFruits((prev) => prev.slice(1))
            }}
            data-testid={`delete-button`}
          >
            delete first
          </Box>
          <Stack divider={<Divider />}>
            {fruits.map((i) => (
              <Fruit key={i.id} name={i.id} onUnmount={unMountMock} />
            ))}
          </Stack>
        </>
      )
    }
    render(<Wrapper data={data} />)
    const items = await screen.findAllByTestId("fruit")
    expect(items).toHaveLength(6)
    expect(unMountMock).not.toHaveBeenCalled()

    const deleteFirst = await screen.findByTestId("delete-button")

    fireEvent.click(deleteFirst)

    await waitFor(() => {
      expect(unMountMock).toHaveBeenCalledWith("apple")
    })

    expect(unMountMock).toHaveBeenCalledTimes(1)
  })
})

describe("<Divider />", () => {
  test("renders with default theming", () => {
    render(<Divider />)
  })

  test("overrides the theming props", () => {
    render(<Divider variant="dashed" />)
  })
})
