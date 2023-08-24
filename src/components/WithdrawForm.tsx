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
  const fetchBalance = api.settings.fetchBalance.useQuery({ id: session.data.user.id });
  // Fetch the user's address when the component mounts


  const updateAddressMutation = api.settings.processWithdraw.useMutation({
    onSuccess: () => {
       // Update the displayed address
      setInputValue(""); // Reset input value
      setErrorValue("Withdrawal Successful");
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (inputValue == null || inputValue == "") {
      setErrorValue("Withdrawal address cannot be empty");
      return;
    }

    if (fetchBalance.data < inputValue)
    setErrorValue("Insufficient Funds");
    return;

    updateAddressMutation.mutate(inputValue);
    
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
          <h1 className="text-lg font-bold">Withdraw</h1>
          <h3>
            Withdraw your funds to the address above. (We take a 2% fee for
            server maintenance)
          </h3>
      <div className="flex gap-4">
        
        <textarea
          ref={inputRef}
          style={{ height: 0 }}
          value={inputValue}
          onChange={(e) => {if (!isNaN(parseFloat(e.target.value))){setInputValue(e.target.value)}else{setInputValue("")}}}
          placeholder="Enter withdraw amount"
          className="w-[200px] sm:w-[400px] md:w-[600px] lg:w-[800px] flex-grow resize-none overflow-hidden rounded-xl border-2 border-gray-500 p-4 text-lg outline-none"
        />
      </div>
      {fetchUser.data != null ? (
            <Button className="">Withdraw</Button>
          ) : (<div className="text-lg font-bold bg-red-300 p-2 rounded-xl">Enter withdrawal address first.</div>)}
      
      {errorValue && <p className="text-xl font-bold">{errorValue}</p>}
    </form>
    </>
  );
}

export function WithdrawForm() {
  const session = useSession();
  if (session.status !== "authenticated") return null;
  return <Form />;
}
