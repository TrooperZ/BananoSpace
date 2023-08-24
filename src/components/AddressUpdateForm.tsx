import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileImage from "./ProfileImage";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";



import type { FormEvent } from "react";
import { api } from "~/utils/api";

function updateTextAreaSize(textArea?: HTMLTextAreaElement) {
  if (textArea == null) return;

  textArea.style.height = "0";
  textArea.style.height = `${textArea.scrollHeight}px`;
}

function Form() {
  const [inputValue, setInputValue] = useState("");
  const [errorValue, setErrorValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const [currentAddress, setCurrentAddress] = useState(""); 
  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);
  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [inputValue]);

  const session = useSession();
  if (session.status !== "authenticated") return null;

  const trpcUtils = api.useContext();

 // State to hold the current address

  const fetchUser = api.settings.fetchAddress.useQuery({ id: session.data.user.id });

  // Fetch the user's address when the component mounts
  useLayoutEffect(() => {

    if (fetchUser.data) {
      setCurrentAddress(fetchUser.data);
    }
  }, [fetchUser.data]);

  const updateAddressMutation = api.settings.updateAddress.useMutation({
    onSuccess: (updatedAddress) => {
      setCurrentAddress(updatedAddress); // Update the displayed address
      setInputValue(""); // Reset input value
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    // Assuming inputValue contains the updated address
    const updatedAddress = inputValue;
    if (updatedAddress == null || updatedAddress == ""){

      setErrorValue("Address cannot be empty");
      return;
    }

    if (updatedAddress == currentAddress) {
      setErrorValue("Address is the same as previous address");
      return;
    }
        
    if (!(updatedAddress.startsWith("ban_1") || updatedAddress.startsWith("ban_3")) || updatedAddress.length != 64) {

      setErrorValue("Address must be valid Banano address");
      return;
    }


    updateAddressMutation.mutate(updatedAddress);
    setErrorValue("");
  };

  if (session.status !== "authenticated") return null;

  return (
    <>
    <div className="h-4">

    </div>
    <form
      onSubmit={handleSubmit}
      className="flex pt-6 rounded-xl mx-5 items-center flex-col gap-2  py-2"
    >
      <p className="text-lg font-bold">Address</p>
      <p>Current Address:</p><p className="rounded-md bg-gray-300 p-2 font-mono text-lg break-all"> {currentAddress}</p>
      <div className="flex gap-4">
        
        <textarea
          ref={inputRef}
          style={{ height: 0 }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter post text"
          className="w-[200px] sm:w-[400px] md:w-[600px] lg:w-[800px] flex-grow resize-none overflow-hidden rounded-xl border-2 border-gray-500 p-4 text-lg outline-none"
        />
      </div>
      <Button className="">Update</Button>
      {errorValue && <p className="text-red-500">Error: {errorValue}</p>}
    </form>
    </>
  );
}

export function AddressUpdateForm() {
  const session = useSession();
  if (session.status !== "authenticated") return null;
  return <Form />;
}
