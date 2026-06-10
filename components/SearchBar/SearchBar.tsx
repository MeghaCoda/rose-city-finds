import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const SearchBar: React.FC = () => {
  return (
    <Field orientation="horizontal">
      <Input type="search" placeholder="Address or Zip Code" />
      <Button>Search</Button>
    </Field>
  )
}

export default SearchBar;
